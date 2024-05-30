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