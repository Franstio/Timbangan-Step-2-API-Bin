import client from '../controllers/TriggerLock.js';
import { io } from '../index.js';
client.setTimeout(5000);

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
let idInterval= null;
export const observeBottomSensor = async (req, res) => {
    if (idInterval != null)
        return;
    const { readTarget } = req.body;
    client.setID(1);
     idInterval = setInterval(async () => {
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
                io.emit('target-'+readTarget,true);
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

export const observeTopSensor = async (req, res) => {
    if (idInterval != null)
        return;
    const { readTargetTop } = req.body;
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
let bottomSensor=null;
let topSensor=null;

export const observeBottomSensorIndicator = async (req, res) => {
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
    //client.setID(1);
     /*idInterval = setInterval(async () => {
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
    }, 100);*/
    res.status(200).json({msg:'ok'});
}


export const observeSensor = async (_io)=>  {
    try {
        client.setID(1);
        if (!client.isOpen) {
            client.open(() => {
                console.log("modbus open");
            });
        }
        
        const [top,bottom] = [0,1];

        const topRes = await client.readHoldingRegisters(top, 1);
        const bottomRes = await client.readHoldingRegisters(bottom,1);
        const topResValue = topRes.data[0];
        const bottomResValue = bottomRes.data[0];
        console.log("received value: "+receivedValue+", target: " + indicatorBottom);
        _io.emit("sensorUpdate",[topResValue,bottomResValue]);
        if (topSensor && topSensor != null && topResValue == topSensor )
        {
//            clearInterval(idInterval);
            _io.emit('target-top-'+topSensor,true);
            topSensor= null;
            return;
        }
        if (bottomSensor && bottomSensor != null && bottomResValue == bottomSensor )
        {
            _io.emit('target-'+bottomSensor,true);
            bottomSensor = null;
            return;
        }
    }
    catch (err) {
        console.log(err);
    }
    finally
    {
        await new Promise((resolve)=> setTimeout(resolve,500) );
    }
};
