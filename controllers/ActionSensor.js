import client from './plcClient.js';
import { io, runningTransaction } from '../index.js';
import { checkLampRed } from './Bin.js';
client.setTimeout(1000);

let bottomSensor=null;
let topSensor=null;
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
    bottomSensor = readTarget;
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
    topSensor = readTargetTop;
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
    PayloadData.push(data);
}
const writeCmd = async (data) => {
    try
    {
        client.setTimeout(100);
        client.setID(data.id);
        await client.writeRegister(data.address,data.value);
        return;
    }
    catch(err)
    {
        await new Promise((resolve) => setTimeout(resolve,100));
        await writeCmd(data);
    }
}
const executePayload = async ()=>{
    
    const s = [...PayloadData];
    PayloadData = [];
    for (let i= 0;i<s.length;i++)
    {
        await writeCmd(s[i]);
//            await new Promise((resolve)=>setTimeout(resolve,1));
    }
    client.setID(1);
}
const dataSensor = [0,0,0,0,0,0,0];
const updateSensor = async (index,newData,_io) =>
{
    await executePayload();
    if (index < 0 || index > dataSensor-1)
        return;
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
            runningTransaction.isRunning  = false;
            console.log("Top Lock Ditutup - " + new Date().toLocaleString());
        }
        topSensor= null;
//            clearInterval(idInterval);
        _io.emit(target,true);
    }
    if ( bottomSensor != null && bottomResValue == bottomSensor )
    {
        const target = 'target-'+bottomSensor;
        bottomSensor = null;
        console.log(newData);
        _io.emit(target,true);
    }
    client.setID(1);
}
const readCmd =  async (address,val) =>
{
    let _res=0;
    try
    {
        _res = await client.readHoldingRegisters(address, val);
        return _res;
    }
    catch
    {
        await new Promise((resolve) => setTimeout(resolve,1));
        return await readCmd(address,val);
    }
}
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
