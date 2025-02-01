import axios from 'axios';
import { client } from '../lib/PLCUtil.js';
import os, { type } from 'os';
import { io, runningTransaction } from '../index.js';
import { pushPayloadData } from './ActionSensor.js';
import { QueuePLC } from '../lib/QueueUtil.js';
import { createClient } from 'redis';

export const switchLamp = async (id, lampType, isAlive) => {
    const dict = {
        "RED": 6,
        "YELLOW":7,
        "GREEN": 8
    };
    const address = dict[lampType];
//    client.setID(1);
    try {
        await QueuePLC.add({id:1,address:address,value: isAlive ? 1 : 0},{removeOnFail:{age: 60*10,count:10},timeout:3000,removeOnComplete:{age:60,count:5}} );
    }
    catch (error) {
    }
//    await new Promise(resolve => setTimeout(function () { return resolve(); }, 10));
};
// const ReadCmd =  async (address,val) =>
// {
//     let _res=0;
//     try
//     {
//         _res = await client.readHoldingRegisters(address, val);
//         return _res;
//     }
//     catch
//     {
//         await new Promise((resolve) => setTimeout(resolve,100));
//         return await ReadCmd(address,val);
//     }
// }
// const WriteCmd = async (data) => {
//     try
//     {
//         client.setTimeout(3000);
//         client.setID(data.id);
//         await client.writeRegister(data.address,data.value);
//         return;
//     }
//     catch(err)
//     {
//         const check =err.message || err;
//         console.log(err.message || err);
//         if (check== 'Timed out' || check == 'CRC error')
//         {
//             await new Promise((resolve) => setTimeout(resolve,100));
//             await WriteCmd(data);
//         }
//     }
//     finally {
//         await new Promise((resolve)=>setTimeout(resolve,100));
//     }
// }
export const LAMP_STATUS = {
    YELLOW: 0
};
export const triggerLampRed = async (bin)=>{
    const limit = (parseFloat(bin.max_weight) /100) * 90;
//    const greenStatus = await ReadCmd(8,1);
    const overLimit = parseFloat(bin.weight) >= parseFloat(bin.max_weight); 
            console.log({weight:bin.weight,limit:limit,status: parseFloat(bin.weight) >= limit});
    await switchLamp(bin.id, 'YELLOW', (!runningTransaction.isRunning &&  !overLimit)  );
    await switchLamp(bin.id,'RED',parseFloat(bin.weight) >= limit);
}
export const checkLampRed = async (io) => {
        try {
            const response = await axios.get(`http://${process.env.TIMBANGAN}/getbinData?hostname=${os.hostname()}`, { withCredentials: false,timeout: 1000 });
            const bin = response.data.bin;
            await triggerLampRed(bin);
        } catch (error) {
            console.log('Error fetching bin data');
            io.emit('refresh',true);
        }

        // Menambahkan delay untuk mencegah request yang berlebihan
//        await new Promise(resolve => setTimeout(resolve, 1000));
    
};

export const checkLampYellow = async () => {
    while (true) {
        try {
            const response = await axios.get(`http://${process.env.TIMBANGAN}/getbinData?hostname=${os.hostname()}`, { withCredentials: false });
            const bin = response.data;
            
            if (parseFloat(bin.weight) > parseFloat(bin.max_weight)) {
                await switchLamp(bin.id, 'YELLOW', false);
            } else {
                await switchLamp(bin.id, 'YELLOW', true);
            }
        } catch (error) {
            console.log('Error fetching bin data:', error);
        }

        // Menambahkan delay untuk mencegah request yang berlebihan
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};

 const transactionInterval = null;
export const startTransaction = async (req,res)=>{
    const {bin } = req.body;
    console.log('start-1-'+ new Date());
    pushPayloadData({id:1,address:7,value: 0});
    pushPayloadData({id:1,address:8,value: 1});    
    console.log('start-2-'+ new Date());
    const isCollection = bin.type == 'Collection';
    const lockId =  isCollection? 5: 4;
    const message =  isCollection ? "Buka Penutup Bawah" : "Buka Penutup Atas";
    pushPayloadData({id:1,address:lockId,value:1});
    runningTransaction.isRunning = true;
    runningTransaction.isReady = false;
    runningTransaction.type = isCollection ? 'Collection' : 'Dispose';
    await saveTransactionBin();
    io.emit('UpdateInstruksi',message);
    io.emit('GetType',bin.type);
    io.emit('Bin',bin);
    if (transactionInterval != null)
        clearInterval(transactionInterval);
    transactionInterval= setInterval(() => {
        runningTransaction.allowReopen = true;
        saveTransactionBin();
    }, 30*1000);
    console.log('start-3-'+ new Date());
    return res.json({msg:"ok"});
}
export const endTransaction = async (req,res)=>{
    const {bin} = req.body;
    
    console.log('end-1-'+ new Date());
    pushPayloadData({id:1,address:7,value: 1});
    pushPayloadData({id:1,address:8,value: 0});    
    runningTransaction.isRunning = false;
    runningTransaction.isReady = true;
    runningTransaction.type = null;
    runningTransaction.bottomSensor = null;
    runningTransaction.topSensor = null;
    if (transactionInterval != null)
        clearInterval(transactionInterval);
    runningTransaction.allowReopen = false;
    await saveTransactionBin();
    io.emit('Bin',bin);
    
    console.log('end-2-'+ new Date());
    if (bin.type == "Dispose")
    {
        io.emit("UpdateInstruksi", "DATA TELAH MASUK");
        setTimeout(()=>{
            io.emit('UpdateInstruksi','');
        },1000); 
    }
    else if (bin.type=='Collection')
    {
        pushPayloadData({id:1,address:5,value:1});
    }
    
    console.log('end-1-'+ new Date());
    return res.json({msg:"ok"});
}

export const receiveInstruksi = async (req,res) =>{
    const {instruksi} = req.body ;
    io.emit('UpdateInstruksi', instruksi);
    res.status(200).json({msg:'ok'});
}

export const receiveType = async (req,res) =>{
    const {type} = req.body ;
    io.emit('GetType', type);
    res.status(200).json({msg:'ok'});
}
export const saveTransactionBin = async ()=>{
    const redisClient = createClient();  
    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();
    const payload = {...runningTransaction};
    payload.bottomSensor = payload.bottomSensor == null ? "" : payload.bottomSensor;
    payload.topSensor = payload.topSensor == null ? "" : payload.topSensor;
    payload.type = payload.type == null ? "" : payload.type;
    payload.isRunning = payload.isRunning ? 1: 0;
    payload.isReady = payload.isReady ? 1 : 0;
    payload.allowReopen = payload.allowReopen ? 1: 0;
    if (!runningTransaction.allowReopen)
        clearInterval(transactionInterval);
    await redisClient.hSet('BinState',{...payload});
    await redisClient.disconnect();
}
export const loadTransactionBin = async ()=>{
  const redisClient = createClient();  
  redisClient.on('error', err => console.log('Redis Client Error', err));
  await redisClient.connect();
  const res = await redisClient.hGetAll('BinState');
  if (res != undefined)
    {
       runningTransaction.isReady = res.isReady == 1;
       runningTransaction.isRunning = res.isRunning==1;
       runningTransaction.type = res.type == "" ?  null : res.type;
       runningTransaction.bottomSensor = res.bottomSensor== "" ? null : res.bottomSensor;
       runningTransaction.topSensor = res.topSensor == "" ? null : res.topSensor;
       runningTransaction.allowReopen = res.allowReopen == 1;
       if (runningTransaction.allowReopen)
        {
            if (transactionInterval != null)
                clearInterval(transactionInterval);
            transactionInterval =  setInterval(() => {
                runningTransaction.allowReopen = true;
                saveTransactionBin();
            }, 30*1000);
        }
    }
  await redisClient.disconnect();
}

export const clearTransactionBin = async ()=>{
  const redisClient = createClient();  
  redisClient.on('error', err => console.log('Redis Client Error', err));
  await redisClient.connect();
  runningTransaction.isRunning = false;
  runningTransaction.type = null;
  runningTransaction.bottomSensor = null;
  runningTransaction.topSensor = null;
  runningTransaction.isReady = true;
  if (transactionInterval != null)
      clearInterval(transactionInterval);
  runningTransaction.allowReopen = false;
  await saveTransactionBin();
  await redisClient.disconnect();
  io.emit('reload',{reload:true});
}