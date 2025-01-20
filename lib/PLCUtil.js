import ModbusRTU from 'modbus-serial';
import { QueuePLCConnection } from './QueueUtil.js';
export const client = new ModbusRTU();


export const readCmd =  async (address,val) =>
{
    let _res=null;
    try
    {
        if (!client.isOpen)
        {
            QueuePLCConnection.add({id:1},{removeOnFail:{age: 60*10,count:10},timeout:3000,removeOnComplete:{age:60,count:5}});
            return;
        }
        _res = await client.readHoldingRegisters(address, val);
        return {..._res,success:true,err:null};
    }
    catch (err)
    {
        console.log(err);
        closeModbus();
        await new Promise((resolve) => setTimeout(resolve,500));
        return {data:[],msg:err,success:false};
    }
}
export const closeModbus = ()=>{
    try
    {
        client.close();
    }
    catch (err)
    {
        console.log(err);
    }
}
export const writeCmd = async (data) => {
    try
    {
        client.setID(data.id);
        const res = await client.writeRegister(data.address,data.value);
        return {success:true,msg:JSON.stringify(res)};
    }
    catch(err)
    {
        closeModbus();
        await new Promise((resolve) => setTimeout(resolve,500));
        return {success: false,msg:err?.message || err};
    }
}

