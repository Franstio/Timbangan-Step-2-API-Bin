import ModbusRTU from 'modbus-serial';
import { SerialPort } from 'serialport';
import { spawnSync} from 'child_process';
export let client = new ModbusRTU();
let sp = null;
export const readCmd = async (address, val) => {
    let _res = null;
    try {
        if (!client.isOpen)
            openModbus(true);
        _res = await client.readHoldingRegisters(address, val);
        _res = { ..._res, success: true, err: null };
    }
    catch (err) {
        console.log({openmodbus:err,status:client.isOpen,cmd:spawnSync('fuser',['/dev/ttyUSB0']).stdout.toString()});
        await new Promise((resolve) => setTimeout(resolve, 500));
        _res = { data: [], msg: err.message, success: false };
    }
    finally {
        await closeModbus(true);
        return _res;
    }
}
export const openModbus = async (buffer) => {
    
    //await client.connectRTU("/dev/ttyUSB0", { baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
    sp = new SerialPort({lock:false,path:"/dev/ttyUSB0",baudRate:9600,autoOpen:true,parity:'none',dataBits:8,stopBits:1}); 
    sp.on('data',(data)=>{

    });
    sp.on('close',(c)=>{
        
    });
    sp.on('error',(err)=>{
        console.log(err.message + "\n" + err.stack);
    });
    client = new ModbusRTU();
    if (process.env.BUFFER_RTU==1 && buffer == true)
        await client.connectRTUBuffered("/dev/ttyUSB0", { baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
    else
        await client.connectRTU("/dev/ttyUSB0", { baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
    const _timeout = process.env.BUFFER_RTU == 1  ? 1000 :300;
    client.setTimeout(_timeout);
    
    client.on('error', (err) => {
        console.log('FROM MODBUS EVENT:');
        console.log(err);
    });
    client.on('close', () => {
    });
}
export const closeModbus = async (buffer ) => {
    try {
        if (process.env.BUFFER_RTU==1 && buffer)
           sp.flush();
        sp.close(()=>{
            
        });
        if (process.env.BUFFER_RTU==1 && buffer)
            await new Promise((resolve) => setTimeout(resolve, 500));

    }
    catch (err) {
        console.log({close_modbus:err});
    }
}
export const writeCmd = async (data) => {
    let result = {};
    try {
        if (!client.isOpen)
            openModbus(false);
        client.setID(data.id);
        const res = await client.writeRegister(data.address, data.value);
        result = { success: true, msg: JSON.stringify(res) };
    }
    catch (err) {        
        result = { success: false, msg: err?.message || err };
        result.success= err.message.toLowerCase().includes("data length");
    }
    finally {
        await closeModbus(false);
        return result;
    }
}

