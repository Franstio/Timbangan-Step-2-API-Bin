import Queue from 'bull';
import { config } from 'dotenv';
import { client,readCmd,writeCmd } from './PLCUtil.js';
import { updateSensor } from '../controllers/ActionSensor.js';
import { io } from '../index.js';

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

const QueuePLCConnection = new Queue("PLC Connection Queue",{
    limiter:{
        duration:1000,
        max: 3
    }
});
const QueuePLC = new Queue('PLC Write Queue',{
    limiter: { 
      duration: 1000,
      max: 3,
    }
  });
const SensorObserveQueue = new Queue("Sensors Observation Task Queue",{
    limiter: { 
      duration: 1000,
      max: 3,
    }
  });
QueuePLCConnection.process( async (job,done)=>{
    try
    {
        await client.connectRTU("/dev/ttyUSB0", { baudRate: 9600 });
        client.setTimeout(3000); 
        LogWrite('PLC Connect Success')
        done(null,'PLC Connection Opened');
    }
    catch
    {
        LogWrite("Failed to Connect PLC");    
        done(er,"Gagal Koneksi PLC");
    }
});
QueuePLC.process(async (job,done)=>{
    if (!client.isOpen)
    {
       QueuePLC.add(job.data,{type:"WR"},{removeOnFail:{age: 60*10,count:10},timeout:3000,removeOnComplete:{age:60,count:5}});
       LogWrite("PLC Belum Terkoneksi, Menghubungkan Koneksi PLC sekarang");
       done({msg:'open connection'},null);
       return; 
    }
    const res = await writeCmd(job.data);
    if (!res.success)
    { 
       QueuePLC.add(job.data,{type:"WR"},{removeOnFail:{age: 60*10,count:10},timeout:3000,removeOnComplete:{age:60,count:5}});
       LogWrite(`Data berhasil dikirim ke PLC, Data: ${JSON.stringify(job.data)}, Result: ${JSON.stringify(res.msg)}` );
       done(res.msg,null);
    }
    else
    {
      LogWrite(`Data Gagal dikirim ke PLC, Data: ${JSON.stringify(job.data)}, Result: ${JSON.stringify(res.msg)}` );
      done(null,res.msg)
    }
  });
QueuePLC.on('active',(job,result)=>{
    if (!client.isOpen)
    {
      LogWrite("PLC Belum Terkoneksi, Menghubungkan Koneksi PLC sekarang");
       QueuePLCConnection.add({id:1},{removeOnFail:{age: 60*10,count:10},timeout:3000,removeOnComplete:{age:60,count:5}});
    }
});
SensorObserveQueue.on('active',(job,result)=>{
    if (!client.isOpen)
    {
      LogWrite("PLC Belum Terkoneksi, Menghubungkan Koneksi PLC sekarang");
       QueuePLCConnection.add({id:1},{removeOnFail:{age: 60*10,count:10},timeout:3000,removeOnComplete:{age:60,count:5}});
    }
});
SensorObserveQueue.process(async (job,done)=>{
    if (!client.isOpen)
    {
       done('PLC Connection Not Open',null);
       LogWrite("PLC Belum Terkoneksi, Menghubungkan Koneksi PLC sekarang");
       return; 
    } 
    client.setID(1);
    const response = [];
    for (let i=0;i<observationDataList.length;i++)
    {
      const data = observationDataList[i];
      const res = await readCmd(data.address,data.value);
      response.push({name: data.name,...res});
      updateSensor(data.index,res.data[0],io);
    }
    LogWrite("Berhasil Membaca ")
    done(null,response);

});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/queues');
const bullBoard = createBullBoard({
    queues: [new BullAdapter(QueuePLCConnection),new BullAdapter(SensorObserveQueue),new BullAdapter(QueuePLC)],
    serverAdapter: serverAdapter,
    options:{
      uiConfig:{
        boardTitle:process.env.NAME
      }
    }
  });
  export {QueuePLC,QueuePLCConnection,SensorObserveQueue,serverAdapter};