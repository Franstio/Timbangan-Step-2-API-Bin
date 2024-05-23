import client from '../controllers/TriggerLock.js';
client.setTimeout(5000);

export const REDLampOn = async (req, res) => {
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
        const address = 6;
        const value = 1;
        const log = await client.writeRegister(address,value);
//        const data = await client.readHoldingRegisters(address, 8);
//        console.log({ log: log, data: data });
       /*  if (value === 1) {
            res.status(200).json({ msg: `Top Lock diBuka` });
        } else {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil ditutup.` });
        } */
        res.status(200).json({ msg: `Lampu Merah Menyala` });

    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

export const REDLampOff = async (req, res) => {
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
        const address = 6;
        const value = 0;
        const log = await client.writeRegister(address,value);
//        const data = await client.readHoldingRegisters(address, 8);
//        console.log({ log: log, data: data });
       /*  if (value === 1) {
            res.status(200).json({ msg: `Top Lock diBuka` });
        } else {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil ditutup.` });
        } */
        res.status(200).json({ msg: `Lampu Merah Mati` });

    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

export const YELLOWLampOn = async (req, res) => {
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
        const address = 7;
        const value = 1;
        const log = await client.writeRegister(address,value);
//        const data = await client.readHoldingRegisters(address, 8);
//        console.log({ log: log, data: data });
       /*  if (value === 1) {
            res.status(200).json({ msg: `Top Lock diBuka` });
        } else {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil ditutup.` });
        } */
        res.status(200).json({ msg: `Lampu Kuning Menyala` });

    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

export const YELLOWLampOff = async (req, res) => {
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
        const address = 7;
        const value = 0;
        const log = await client.writeRegister(address,value);
//        const data = await client.readHoldingRegisters(address, 8);
//        console.log({ log: log, data: data });
       /*  if (value === 1) {
            res.status(200).json({ msg: `Top Lock diBuka` });
        } else {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil ditutup.` });
        } */
        res.status(200).json({ msg: `Lampu Kuning Mati` });

    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

export const GREENLampOn = async (req, res) => {
    try {
        const {idLockTop} = req.body;
        console.log(idLockTop);
       client.setID(idLockTop);
        if (!client.isOpen) {
            client.open( () => {
                console.log("modbus open");
           });
        }
        const address = 8;
        const value = 1;
        const log = await client.writeRegister(address,value);
//        const data = await client.readHoldingRegisters(address, 8);
//        console.log({ log: log, data: data });
       /*  if (value === 1) {
            res.status(200).json({ msg: `Top Lock diBuka` });
        } else {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil ditutup.` });
        } */
        res.status(200).json({ msg: `Lampu Hijau Menyala` });

    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

export const GREENLampOff = async (req, res) => {
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
        const address = 8;
        const value = 0;
        const log = await client.writeRegister(address,value);
//        const data = await client.readHoldingRegisters(address, 8);
//        console.log({ log: log, data: data });
       /*  if (value === 1) {
            res.status(200).json({ msg: `Top Lock diBuka` });
        } else {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil ditutup.` });
        } */
        res.status(200).json({ msg: `Lampu Hijau Mati` });

    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

export const switchLamp = async (id, lampType, isAlive) => {
    const dict = {
        "RED": 6,
        "GREEN": 8,
        "YELLOW": 7
    };
    const address = dict[lampType];
    client.setID(id);
    try {
        await client.writeRegister(address, isAlive ? 1 : 0);
    }
    catch (error) {
        console.log([error, id, lampType, address, isAlive]);
    }
    await new Promise(resolve => setTimeout(function () { return resolve(); }, 2000));
}