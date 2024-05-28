import client from '../controllers/TriggerLock.js';
client.setTimeout(5000);

export const SensorTop = async (req,res) => {
    const {SensorTopId} = req.body;
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

export const SensorBottom = async (req,res) => {
     const {SensorBottomId} = req.body;
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
