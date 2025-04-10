import ModbusRTU from 'modbus-serial';
import { SerialPort } from 'serialport';
import { execSync, spawnSync} from 'child_process';
import fs from 'fs';
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
    sp = new SerialPort({lock:false,path:process.env.USBPATH,baudRate:9600,autoOpen:true,parity:'none',dataBits:8,stopBits:1}); 
    sp.on('data',(data)=>{

    });
    sp.on('close',(c)=>{
        
    });
    sp.on('error',(err)=>{
        console.log(err.message + "\n" + err.stack);
    });
    client = new ModbusRTU();
    if (process.env.BUFFER_RTU==1 && buffer == true)
        await client.connectRTUBuffered(process.env.USBPATH, { baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
    else
        await client.connectRTU(process.env.USBPATH, { baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none' });
    const _timeout = process.env.BUFFER_RTU == 1  ? 3000 :1000;
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
        // if (process.env.BUFFER_RTU==1 && buffer)
        //    sp.flush();
        sp.close(()=>{
            
        });
        if (process.env.BUFFER_RTU==1 && buffer)
            await new Promise((resolve) => setTimeout(resolve, 500));

    }
    catch (err) {
        console.log({close_modbus:err});
    }
}
export const ResetUsb = ()=>{
    try
    {
        const res = execSync(`sudo usbreset ${process.env.PLC_ID}`).toString();
        const usbresetFn = "usbreset_"  + moment(new Date()).format('YYYY_MM_DD') + ".txt";
        fs.writeFileSync(usbresetFn,'Reset USB: ' + res + ' - '+ new Date().toLocaleString()+"\n");
    }
    catch (er)
    {
        
        const usbresetFn = "usbreset_"  + moment(new Date()).format('YYYY_MM_DD') + ".txt";
        fs.writeFileSync(usbresetFn,'Reset USB: ' + er?.message ?? er + ' - '+ new Date().toLocaleString()+"\n");
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

