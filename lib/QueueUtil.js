import Queue from 'bull';
import { config } from 'dotenv';
import { client,readCmd,writeCmd } from './PLCUtil.js';
import { observeLock, pushPayloadData, updateSensor } from '../controllers/ActionSensor.js';
import { io, runningTransaction } from '../index.js';

import { ExpressAdapter } from '@bull-board/express';
import {createBullBoard} from '@bull-board/api';
import {BullAdapter} from '@bull-board/api/bullAdapter.js';

export const LogWrite = (log)=>{
    console.log(`${log} - ${new Date().toLocaleString()}`);
}
export const observationDataList =          [
  {address:0,value:1,index:0,name:"Top Sensor"},
  {address:1,value:1,index:1, name:"Bottom Sensor"},
  {address:6,value:1,index:2,name: "Red Lamp"},
  {address:7,value:1,index:3,name:"Yellow Lamp"},
  {address:8,value:1,index:4,name:"Green Lamp"},
  {address:4,value:1,index:5,name:"Top Lock"},
  {address:5,value:1,index:6,name:"Bottom Lock"},
];

// const QueuePLCConnection = new Queue("PLC Connection Queue",{
//     limiter:{
//         duration:1000,
//         max: 3
//     }
// });
const QueuePLC = new Queue('PLC Write Queue',{
    limiter: { 
      duration: 1000,
      max: 1,
    }
  });
const SensorObserveQueue = new Queue("Sensors Observation Task Queue",{
    limiter: { 
      duration: 1000,
      max: 1,
    }
  });
// QueuePLCConnection.process( async (job,done)=>{
//     try
//     {
//         await client.connectRTU("/dev/ttyUSB0", { baudRate: 9600,dataBits:8,stopBits:1,parity: 'none'});
//         client.setTimeout(10000); 
//         LogWrite('PLC Connect Success')
//         done(null,'PLC Connection Opened');
//     }
//     catch (er)
//     {
//         LogWrite("Failed to Connect PLC");    
//         done(er,"Gagal Koneksi PLC");
//     }
// });
// QueuePLCConnection.on('active',async (job,done)=>{
//   await QueuePLC.pause();
//   await SensorObserveQueue.pause();
// });
// QueuePLCConnection.on('completed',async (job,done)=>{
//   await QueuePLC.resume();
//   await SensorObserveQueue.resume();
// });
// QueuePLCConnection.on('failed', (job,done)=>{
//   QueuePLCConnection.add(job,{delay:500});
// });
QueuePLC.process(async (job,done)=>{
    const count = job.data.count != undefined && job.data.count != null  ? job.data.count : 1 ;
    const res = await writeCmd(job.data);
    if (res.success)
    { 
       LogWrite(`Data berhasil dikirim ke PLC, Data: ${JSON.stringify(job.data)}, Result: ${JSON.stringify(res.msg)}` );
       done(null,res.msg);
    }
    else
    {
      if (job.data.count <= 3)
      {
        job.data.count = count++;
        QueuePLC.add(job.data,{type:"WR"},{removeOnFail:{age: 60*10,count:10},timeout:3000,removeOnComplete:{age:60,count:5}});
      }
      LogWrite(`Data Gagal dikirim ke PLC, Data: ${JSON.stringify(job.data)}, Result: ${JSON.stringify(res.msg)}` );
      done(res.msg,null);
    }
  });
// QueuePLC.on('active',async (job,result)=>{
//     await SensorObserveQueue.pause();
// });
// QueuePLC.on('completed',async (job,res)=>{
//   await SensorObserveQueue.resume();
// });
// QueuePLC.on('error',async (job,res)=>{
//   await SensorObserveQueue.resume();
// });
// QueuePLC.on('failed',async(job,res)=>{
//   await SensorObserveQueue.resume();
// })
SensorObserveQueue.process(async (job,done)=>{
  try
  {
    client.setID(1);
    const response = [];
    const plcData = await readCmd(0,10);
    if (!plcData.success)
    { 
      SensorObserveQueue.add({type:'observe'},{
        removeOnFail:{count:10},timeout:3000,removeOnComplete:{count:5}
      });
      LogWrite(plcData.msg);
      done(plcData.msg,null);
      return;
    }
    for (let i=0;i<observationDataList.length;i++)
    {
      const data = observationDataList[i];
      const res = plcData.data[data.address];
      observationDataList[i] = {...observationDataList[i],result: res};
      response.push({name: data.name,value:res});
      await updateSensor(data.index,res,io);    
    }
    LogWrite("Berhasil Membaca:\n"+ JSON.stringify(observationDataList));

    const yellowLamp = observationDataList.find(x=>x.name=="Yellow Lamp");
    const greenLamp = observationDataList.find(x=>x.name=="Green Lamp");
    if ( plcData.data[yellowLamp.address] == 0  && runningTransaction.isReady)
    {
        pushPayloadData({id:1,address:7,value: 1});
    }
    if ( plcData.data[greenLamp.address] == 1 && runningTransaction.isReady)
    {    
        pushPayloadData({id:1,address:8,value: 0});    
    }
    if (runningTransaction.allowReopen)
      observeLock(io,plcData.data);
    else  
      io.emit('reopen',{ reopen:false});
//    LogWrite([plcData.data[yellowLamp.address] !=1,plcData.data[greenLamp.address] != 0]);
    SensorObserveQueue.add({type:'observe'},{
      removeOnFail:{count:10},timeout:3000,removeOnComplete:{count:5}
    });
    done(null,response);
  }
    catch (er)
    {
      console.log(er);
      SensorObserveQueue.add({type:'observe'},{
        removeOnFail:{count:10},timeout:3000,removeOnComplete:{count:5}
      });
      LogWrite(er?.message || JSON.stringify(er));
      done(er,null);
    }
});
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/queues');
const bullBoard = createBullBoard({
    queues: [
      // new BullAdapter(QueuePLCConnection),
      new BullAdapter(SensorObserveQueue),
      new BullAdapter(QueuePLC)],
    serverAdapter: serverAdapter,
    options:{
      uiConfig:{
        boardTitle:process.env.NAME
      }
    }
  });
  export {QueuePLC,
    // QueuePLCConnection,
    SensorObserveQueue,serverAdapter};