import { client } from '../lib/PLCUtil.js';
import { io, runningTransaction } from '../index.js';
import { checkLampRed, saveTransactionBin } from './Bin.js';
import { QueuePLC } from '../lib/QueueUtil.js';
import { readCmd } from '../lib/PLCUtil.js';
//client.setTimeout(1000);

export const SensorTop = async (req, res) => {
    const { SensorTopId } = req.body;
    let receivedValue = null;
    try {
        client.setID(SensorTopId);
        if (!client.isOpen) {
            client.open(() => {
            });
        }

        const address = 0;

        const response = await readCmd(address, 1);
        receivedValue = response.data[0];

        res.status(200).json({ sensorTop: receivedValue });
    } catch (error) {
        res.status(200).json({ sensorTop: receivedValue });
    }
};

export const SensorBottom = async (req, res) => {
    const { SensorBottomId } = req.body;
    try {
        client.setID(SensorBottomId);
        if (!client.isOpen) {
            client.open(() => {
            });
        }

        const address = 1;

        const response = await readCmd(address, 1);
        const receivedValue = response.data[0];

        res.status(200).json({ sensorBottom: receivedValue });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
let topIdInterval= null;
let bottomIdInterval =null;
export const observeBottomSensor = async (req, res) => {
/*    if (bottomIdInterval != null)
        return res.status(200).json({msg: "Target Already Started"});*/
    const { readTarget } = req.body;
/*    if (readTarget == undefined || readTarget==null)
        return res.status(200).json({msg: "Target not found"});*/
    runningTransaction.bottomSensor = readTarget;
    await saveTransactionBin();
    /*client.setID(1);
     bottomIdInterval = setInterval(async () => {
        try {
            if (!client.isOpen) {
                client.open(() => {
                });
            }
            
            const address = 1;

            const response = await client.readHoldingRegisters(address, 1);
            const receivedValue = response.data[0];
            if (receivedValue == readTarget)
            {
                clearInterval(bottomIdInterval);
                bottomIdInterval  = null;
                
                await new Promise((resolve)=> setTimeout(resolve,500) );
                io.emit('target-'+readTarget,true);
                return;
            }
        }
        catch (err) {
        }
    }, 1000);*/
    res.status(200).json({msg:'ok'});
}

export const observeTopSensor = async (req, res) => {
/*    if (topIdInterval != null)
        return res.status(200).json({msg: "Target Already Started"});*/
    const { readTargetTop } = req.body;
/*    if (readTargetTop == undefined || readTargetTop==null)
        return res.status(200).json({msg: "Target not found"});*/
    runningTransaction.topSensor = readTargetTop;
    await saveTransactionBin();
    /*client.setID(1);
     topIdInterval = setInterval(async () => {
        try {
            if (!client.isOpen) {
                client.open(() => {
                });
            }
            
            const address = 0;

            const response = await client.readHoldingRegisters(address, 1);
            const receivedValue = response.data[0];
            if (receivedValue == readTargetTop)
            {
                clearInterval(topIdInterval);
                topIdInterval  = null;
                await new Promise((resolve)=> setTimeout(resolve,500) );
                io.emit('target-top-'+readTargetTop,true);
                return;
            }
        }
        catch (err) {
        }
    }, 1000);*/
    res.status(200).json({msg:'ok'});
}

/*export const observeBottomSensorIndicator = async (req, res) => {
    if (idInterval != null)
        return;
    const { indicatorBottom } = req.body;
    bottomSensor=indicatorBottom;
    res.status(200).json({msg:'ok'});
}

export const observeTopSensorIndicator = async (req, res) => {
    if (idInterval != null)
        return;
    const { readTargetTop } = req.body;
    topSensor = readTargetTop;
    client.setID(1);
     idInterval = setInterval(async () => {
        try {
            if (!client.isOpen) {
                client.open(() => {
                });
            }
            
            const address = 0;

            const response = await client.readHoldingRegisters(address, 1);
            const receivedValue = response.data[0];
            if (receivedValue == readTargetTop)
            {
                io.emit('target-top-'+readTargetTop,true);
                clearInterval(idInterval);
                idInterval  = null;
                return;
            }
        }
        catch (err) {
        }
    }, 100);
    res.status(200).json({msg:'ok'});
}
*/
let PayloadData =[];
export const pushPayloadData =(data)=>{
//    PayloadData.push(data);
      QueuePLC.add(data,{removeOnFail:{age: 60*10,count:10},timeout:3000,removeOnComplete:{age:60,count:5}});
}
// const writeCmd = async (data) => {
//     try
//     {
//         client.setID(data.id);
//         await client.writeRegister(data.address,data.value);
//     }
//     catch(err)
//     {
//         const check =err.message || err;
//         console.log(`Err ${check} ` + new Date());
//         if (check== 'Timed out' || check == 'CRC error')
//         {
//             await new Promise((resolve) => setTimeout(resolve,100));
//             await writeCmd(data);
//         }
//     }
    
//     finally {
        
//         await new Promise((resolve)=>setTimeout(resolve,10));
//     }
// }
// const executePayload = async ()=>{
    
//     const s = [...PayloadData];
//     PayloadData = [];
//     if (s.length > 0)
//         console.log(s);
//     for (let i= 0;i<s.length;i++)
//     {
//         await writeCmd(s[i]);
// //            await new Promise((resolve)=>setTimeout(resolve,1));
//     }
//     client.setID(1);
// }
const dataSensor = [0,0,0,0,0,0,0];
export const updateSensor = async (index,newData,_io) =>
{
    if (index < 0 || index > dataSensor-1)
        return;
    const topSensor = runningTransaction.topSensor;
    const bottomSensor = runningTransaction.bottomSensor;
    dataSensor[index] = newData;
    _io.emit("sensorUpdate",dataSensor);    
    let topResValue = dataSensor[0];
    let bottomResValue = dataSensor[1];
    if (topSensor != null && topResValue == topSensor )
    {
        console.log([topResValue,topSensor]);
        const target = 'target-top-'+topSensor;
        if (topSensor=="1" || topSensor==1)
        {
            // runningTransaction.isRunning  = false;
            // runningTransaction.type = null;
            console.log("Top Lock Ditutup - " + new Date().toLocaleString());
        }
        runningTransaction.topSensor= null;
//            clearInterval(idInterval);
        _io.emit(target,true);
    }
    if ( bottomSensor != null && bottomResValue == bottomSensor )
    {
        const target = 'target-'+bottomSensor;
        runningTransaction.bottomSensor = null;
        console.log(newData);
        _io.emit(target,true);
    }
    await saveTransactionBin();
    client.setID(1);
}
// const readCmd =  async (address,val) =>
// {
//     let _res=0;
//     try
//     {
//         client.setTimeout(1000);
//         _res = await client.readHoldingRegisters(address, val);
        
//         return _res;
//     }
//     catch(err)
//     {
        
//         const check =err.message || err;
//         console.log(`Err ${check} ` + new Date());
//         await new Promise((resolve) => setTimeout(resolve,50));
//         return await readCmd(address,val);
//     }
// }
export const observeSensor = async (_io)=>  {

    while(true)
    {
    try {
        if (!client.isOpen) {
            client.open(() => {
            });
        }
        await checkLampRed(io);
        await executePayload();
        
        
        
        client.setID(1);
        const topRes = await readCmd(0, 1);
        await updateSensor(0, topRes.data[0],_io);
       // await new Promise((resolve)=> setTimeout(resolve,100));
        const bottomRes = await readCmd(1,1);
        await updateSensor(1,bottomRes.data[0],_io);
        const redLamp = await readCmd(6,1);
        await updateSensor(2,redLamp.data[0],_io);
        const yellowLamp = await readCmd(7,1);
        await updateSensor(3,yellowLamp.data[0],_io);
        const greenLamp = await readCmd(8,1);
        await updateSensor(4,greenLamp.data[0],_io);
        const locktop = await readCmd(4,1);
        await updateSensor(5,locktop.data[0],_io);
        const lockbottom = await readCmd(5,1);
        await updateSensor(6,lockbottom.data[0],_io);
        await observeLock(_io,dataSensor);
/*        const topResValue = topRes.data[0];
        const bottomResValue = bottomRes.data[0];
        _io.emit("sensorUpdate",[topResValue,bottomResValue,redLamp.data[0],yellowLamp.data[0],greenLamp.data[0],locktop.data[0],lockbottom.data[0]]);*/
    }
    catch (err) {
        console.log(err);
    }
    finally
    {
        await new Promise((resolve)=> setTimeout(resolve,10) );
    }
}
};


export const observeLock = async (_io,data)=>{
    if (runningTransaction.isRunning)
    {
        const [lockAddress,sensorAddress,triggerLockAddress]  = runningTransaction.type == 'Collection'? [6,1,5]  : [5,0,4];
        if (data[lockAddress] == 0 && data[sensorAddress] == 1)
        {
            _io.emit('reopen', {reopen:true});
            return;
        }      
    }
    _io.emit('reopen',{ reopen:false})
}