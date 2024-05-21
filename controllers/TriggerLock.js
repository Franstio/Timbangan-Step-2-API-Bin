import ModbusRTU from 'modbus-serial';
const client = new ModbusRTU();
client.connectRTU("/dev/ttyUSB0", { baudRate: 9600 });
client.setTimeout(5000); 
import os from 'os';


export const lockTop = async (req, res) => {
    try {
        const {idLockTop} = req.body;
	//console.log({id: idRollingDoor});

       client.setID(idLockTop);
        if (!client.isOpen) {
            client.open( () => {
                console.log("modbus open");
           });
        }
        console.log(idLockTop);
        const address = 20;
        const value = 1;
        const log = await client.writeRegister(address,value);
//        const data = await client.readHoldingRegisters(address, 8);
//        console.log({ log: log, data: data });
       /*  if (value === 1) {
            res.status(200).json({ msg: `Top Lock diBuka` });
        } else {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil ditutup.` });
        } */
        res.status(200).json({ msg: `Top Lock diBuka` });

    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

export const lockBottom = async (req, res) => {
    try {
        const {idLockBottom} = req.body;
	//console.log({id: idRollingDoor});

       client.setID(idLockBottom);
        if (!client.isOpen) {
            client.open( () => {
                console.log("modbus open");
           });
        }
        const address = 20;
        const value = 1;
        const log = await client.writeRegister(address,value);
//        const data = await client.readHoldingRegisters(address, 8);
//        console.log({ log: log, data: data });
       /*  if (value === 1) {
            res.status(200).json({ msg: `Top Lock diBuka` });
        } else {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil ditutup.` });
        } */
        res.status(200).json({ msg: `Bottom Lock diBuka` });

    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

export const getHostname = async (req,res) =>{
    res.status(200).json({hostname: os.hostname()});
}