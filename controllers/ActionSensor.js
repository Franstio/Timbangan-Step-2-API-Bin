import client from '../controllers/TriggerLock.js';
import { io } from '../index.js';
import { checkLampRed } from './Bin.js';
client.setTimeout(5000);

let bottomSensor=null;
let topSensor=null;
export const SensorTop = async (req, res) => {
    const { SensorTopId } = req.body;
    console.log(SensorTopId);
    let receivedValue = null;
    try {
        client.setID(SensorTopId);
        if (!client.isOpen) {
            client.open(() => {
                console.log("modbus open");
            });
        }

        const address = 0;

        const response = await client.readHoldingRegisters(address, 1);
        receivedValue = response.data[0];

        res.status(200).json({ sensorTop: receivedValue });
    } catch (error) {
        console.log(error);
        res.status(200).json({ sensorTop: receivedValue });
    }
};

export const SensorBottom = async (req, res) => {
    const { SensorBottomId } = req.body;
    console.log(SensorBottomId);
    try {
        client.setID(SensorBottomId);
        if (!client.isOpen) {
            client.open(() => {
                console.log("modbus open");
            });
        }

        const address = 1;

        const response = await client.readHoldingRegisters(address, 1);
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
                    console.log("modbus open");
                });
            }
            
            const address = 1;

            const response = await client.readHoldingRegisters(address, 1);
            const receivedValue = response.data[0];
            console.log("received value: "+receivedValue+", target: " + readTarget);
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
            console.log(err);
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
                    console.log("modbus open");
                });
            }
            
            const address = 0;

            const response = await client.readHoldingRegisters(address, 1);
            const receivedValue = response.data[0];
            console.log("received value: "+receivedValue+", target: " + readTargetTop);
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
            console.log(err);
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
                    console.log("modbus open");
                });
            }
            
            const address = 0;

            const response = await client.readHoldingRegisters(address, 1);
            const receivedValue = response.data[0];
            console.log("received value: "+receivedValue+", target: " + readTargetTop);
            if (receivedValue == readTargetTop)
            {
                io.emit('target-top-'+readTargetTop,true);
                clearInterval(idInterval);
                idInterval  = null;
                return;
            }
        }
        catch (err) {
            console.log(err);
        }
    }, 100);
    res.status(200).json({msg:'ok'});
}
*/
export let PayloadData =[];

export const observeSensor = async (_io)=>  {
    while(true)
    {
    try {
        client.setID(1);
        if (!client.isOpen) {
            client.open(() => {
                console.log("modbus open");
            });
        }
        await checkLampRed();
        const topRes = await client.readHoldingRegisters(0, 1);
       // await new Promise((resolve)=> setTimeout(resolve,100));
        const bottomRes = await client.readHoldingRegisters(1,1);
        const redLamp = await client.readHoldingRegisters(6,1);
        const yellowLamp = await client.readHoldingRegisters(7,1);
        const greenLamp = await client.readHoldingRegisters(8,1);
        const locktop = await client.readHoldingRegisters(4,1);
        const lockbottom = await client.readHoldingRegisters(5,1);
        const topResValue = topRes.data[0];
        const bottomResValue = bottomRes.data[0];
        console.log("topres value: "+topResValue+" ,bottomres value: " + bottomResValue + ", target top:" + topSensor + " , target bottom: " + bottomSensor);
        console.log([topResValue,bottomResValue,redLamp.data[0],yellowLamp.data[0],greenLamp.data[0],locktop.data[0],lockbottom.data[0]]);
        _io.emit("sensorUpdate",[topResValue,bottomResValue,redLamp.data[0],yellowLamp.data[0],greenLamp.data[0],locktop.data[0],lockbottom.data[0]]);
        if (topSensor != null && topResValue == topSensor )
        {
            const target = 'target-top-'+topSensor;
            topSensor= null;
//            clearInterval(idInterval);
            _io.emit(target,true);
        }
        if ( bottomSensor != null && bottomResValue == bottomSensor )
        {
            const target = 'target-'+bottomSensor;
            bottomSensor = null;

            _io.emit(target,true);
        }
        const s = [...PayloadData];
        for (let i= 0;i<s.length;i++)
        {
            await client.setID(s[i].id);
            await client.writeRegister(s[i].address,s[i].value);
            await new Promise((resolve)=>setTimeout(resolve,1));
        }
        PayloadData = [];
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
