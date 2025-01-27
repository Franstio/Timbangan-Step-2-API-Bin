import ModbusRTU from 'modbus-serial';
import { SerialPort } from 'serialport';
import { spawnSync} from 'child_process';
export let client = new ModbusRTU();
let sp = null;
export const readCmd = async (address, val) => {
    let _res = null;
    try {
        if (!client.isOpen)
            openModbus();
        _res = await client.readHoldingRegisters(address, val);
        _res = { ..._res, success: true, err: null };
    }
    catch (err) {
        console.log({openmodbus:err,status:client.isOpen,cmd:spawnSync('fuser',['/dev/ttyUSB0']).stdout.toString()});
        await new Promise((resolve) => setTimeout(resolve, 500));
        _res = { data: [], msg: err, success: false };
    }
    finally {
//        await closeModbus();
        return _res;
    }
}
export const openModbus = async () => {
    
    //await client.connectRTU("/dev/ttyUSB0", { baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
    sp = new SerialPort({lock:false,path:"/dev/ttyUSB0",baudRate:9600,autoOpen:true,parity:'none',dataBits:8,stopBits:1}); 
    sp.on('data',(data)=>{

    });
    sp.on('close',(c)=>{
        console.log('close sp');
    });
    client = new ModbusRTU();
    await client.connectRTU("/dev/ttyUSB0", { baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
    client.setTimeout(10000);
    
    client.on('error', (err) => {
        console.log('FROM MODBUS EVENT:');
        console.log(err);
    });
    client.on('close', () => {
        console.log('MODBUS CLOSING');
    });
}
export const closeModbus = async () => {
    try {
        await new Promise((resolve) => {
            try {
                console.log({modbus: client.isOpen,cmd: spawnSync('fuser',['/dev/ttyUSB0']).stdout.toString()});
                sp.close(() => {
                    console.log("closing");
                    console.log({modbus: client.isOpen,cmd:spawnSync('fuser',['/dev/ttyUSB0']).stdout.toString()});
                    resolve('');
                });
                console.log({ statusPort: client.isOpen });
            }
            catch (err) {
                console.log(err);
                resolve(null);
            }
        });
    }
    catch (err) {
        console.log({close_modbus:err});
    }
}
export const writeCmd = async (data) => {
    let result = {};
    try {
        if (!client.isOpen)
        openModbus();
        client.setID(data.id);
        const res = await client.writeRegister(data.address, data.value);
        result = { success: true, msg: JSON.stringify(res) };
    }
    catch (err) {
        result = { success: false, msg: err?.message || err };
    }
    finally {
      //  await closeModbus();
        return result;
    }
}

