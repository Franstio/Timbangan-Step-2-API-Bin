import client from '../controllers/TriggerLock.js';
client.setTimeout(5000);

export const SensorTop = async (res) => {
    const {SensorTopId} = req.body;
    console.log(SensorTopId);
    try {
        client.setID(SensorTopId);
        if (!client.isOpen) {
            client.open(() => {
                console.log("modbus open");
            });
        }
        
        const address = 0; 
        
        const response = await client.readHoldingRegisters(address, 1); 
        const receivedValue = response.data[0]; 
        
        res.status(200).json({ sensorTop: receivedValue }); 
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const SensorBottom = async (res) => {
    try {
        client.setID(1);
        if (!client.isOpen) {
            client.open(() => {
                console.log("modbus open");
            });
        }
        
        const address = 1; 
    
        const response = await client.readHoldingRegisters(address, 1);
        const receivedValue = response.data[0]; 
        
        res.status(200).json({ msg: `Sensor Bottom: ${receivedValue}` });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
