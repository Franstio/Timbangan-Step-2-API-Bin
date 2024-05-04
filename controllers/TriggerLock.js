import ModbusRTU from 'modbus-serial';

const client = new ModbusRTU();


/* export const controlLock = async (req, res) => {
    try {
        const action = req.body.action; 
        client.setID(1);
        let value = 0;
        if (action === 'open') {
            value = 1;
        } else if (action === 'close') {
            value = 0;
        } else {
            throw new Error('Aksi tidak valid.');
        }

        await client.writeRegisters(5, [value]);
        if (action === 'open') {
            res.status(200).json({ msg: 'Kunci berhasil dibuka.' });
        } else {
            res.status(200).json({ msg: 'Kunci berhasil ditutup.' });
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
 */

export const controlLock = async (req, res) => {
    try {
        const address = req.body.address;
        console.log(address)
        const value = req.body.value;

        client.setID(1);
        await client.writeRegisters(address, [value]);

        if (value === 1) {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil dibuka.` });
        } else {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil ditutup.` });
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

