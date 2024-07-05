import ModbusRTU from 'modbus-serial';
const client = new ModbusRTU();
client.connectRTU("/dev/ttyUSB0", { baudRate: 9600 });
client.setTimeout(5000); 
import os from 'os';
export default client;


export const lockTop = async (req, res) => {
    let c = 0;
    let err = '';
    do{
    try {
        const {idLockTop} = req.body;
        console.log(idLockTop);
	//console.log({id: idRollingDoor});

       client.setID(idLockTop);
        if (!client.isOpen) {
            client.open( () => {
                console.log("modbus open");
           });
        }
        const address = 4;
        const value = 1;
        const log = await client.writeRegister(address,value);
        //await new Promise(resolve => setTimeout(function () { return resolve(); }, 3500));
//        const data = await client.readHoldingRegisters(address, 8);
//        console.log({ log: log, data: data });
       /*  if (value === 1) {
            res.status(200).json({ msg: `Top Lock diBuka` });
        } else {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil ditutup.` });
        } */
        return res.status(200).json({ msg: `Top Lock diBuka` });

    } catch (error) {
        err =  error;
        c =c+1;
    }
    }
    while (c < 10);
    return res.status(500).json({ msg: err });
    
};

export const lockBottom = async (req, res) => {
    let c= 0;
    let err='';
    do
    {
    try {
        const {idLockBottom} = req.body;
	//console.log({id: idRollingDoor});

       client.setID(idLockBottom);
        if (!client.isOpen) {
            client.open( () => {
                console.log("modbus open");
           });
        }
        const address = 5;
        const value = 1;
        const log = await client.writeRegister(address,value);
        
        //await new Promise(resolve => setTimeout(function () { return resolve(); }, 3500));
//        const data = await client.readHoldingRegisters(address, 8);
//        console.log({ log: log, data: data });
       /*  if (value === 1) {
            res.status(200).json({ msg: `Top Lock diBuka` });
        } else {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil ditutup.` });
        } */
        return res.status(200).json({ msg: `Bottom Lock diBuka` });

    } catch (error) {
        err = error;
        c = c+1;
    }
    }
    while (c < 10);
    return res.status(500).json({ msg: err });
};

export const getHostname = async (req,res) =>{
    res.status(200).json({hostname: os.hostname()});
}