import ModbusRTU from 'modbus-serial';
import { SerialPort } from 'serialport';
export let client = new ModbusRTU();
client.on('error',(err)=>{
    console.log('FROM MODBUS EVENT:');
    console.log(err);
  });
client.on('close',()=>{
    console.log('MODBUS CLOSING');
});
export const readCmd =  async (address,val) =>
{
    let _res=null;
    try
    {
        openModbus();
        _res = await client.readHoldingRegisters(address, val);
        _res =  {..._res,success:true,err:null};
    }
    catch (err)
    {
        console.log(err);
        await new Promise((resolve) => setTimeout(resolve,500));
        _res =  {data:[],msg:err,success:false};
    }
    finally
    {
        await closeModbus();
        return _res;
    }
}
export const openModbus = async ()=>{
        await client.connectRTU("/dev/ttyUSB0", { baudRate: 9600,dataBits:8,stopBits:1,parity: 'none'});
        client.setTimeout(10000); 
}
export const closeModbus = async ()=>{
    try
    {
        
        await new Promise((resolve) =>{
            try
            {
                client.close(()=>{
                    console.log("closing");
                    client.destroy(()=>{

                    console.log('destroying');
                    client  = new ModbusRTU();
                    const _port = new SerialPort({
                        path:'/dev/ttyUSB0',
                        lock: false,
                        baudRate:9600
                    });
                    _port.destroy(()=>{
                        console.log('serial destroy');
                    });
                    resolve('ok');
                    });
                });
                console.log({statusPort: client.isOpen});
            }
            catch (err)
            {
                console.log(err);
                resolve(null);
            }
        });
    }
    catch (err)
    {
        console.log(err);
    }
}
export const writeCmd = async (data) => {
    let result = {};
    try
    {
        openModbus();
        client.setID(data.id);
        const res = await client.writeRegister(data.address,data.value);
        result = {success:true,msg:JSON.stringify(res)};
    }
    catch(err)
    {
        result = {success: false,msg:err?.message || err};
    }
    finally
    {
        await closeModbus();
        return result;
    }
}

