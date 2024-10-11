import axios from 'axios';
import client from './plcClient.js';
import os from 'os';
import { io, runningTransaction } from '../index.js';
import { pushPayloadData } from './ActionSensor.js';

export const switchLamp = async (id, lampType, isAlive) => {
    const dict = {
        "RED": 6,
        "YELLOW":7,
        "GREEN": 8
    };
    const address = dict[lampType];
//    client.setID(1);
    try {
        await WriteCmd({id:1,address:address,value: isAlive ? 1 : 0} );
    }
    catch (error) {
    }
//    await new Promise(resolve => setTimeout(function () { return resolve(); }, 10));
};
const ReadCmd =  async (address,val) =>
{
    let _res=0;
    try
    {
        _res = await client.readHoldingRegisters(address, val);
        return _res;
    }
    catch
    {
        await new Promise((resolve) => setTimeout(resolve,100));
        return await ReadCmd(address,val);
    }
}
const WriteCmd = async (data) => {
    try
    {
        client.setTimeout(1000);
        client.setID(data.id);
        await client.writeRegister(data.address,data.value);
        return;
    }
    catch(err)
    {
        console.log(JSON.stringify(err));
        if (err.name)
        {
            await new Promise((resolve) => setTimeout(resolve,10));
            await WriteCmd(data);
        }
    }
}
export const triggerLampRed = async (bin)=>{
    const limit = (parseFloat(bin.max_weight) /100) * 90;
    const greenStatus = await ReadCmd(8,1);
    const overLimit = parseFloat(bin.weight) >= parseFloat(bin.max_weight); 
//            console.log({weight:bin.weight,limit:limit,status: parseFloat(bin.weight) >= limit});
    await switchLamp(bin.id, 'YELLOW', (greenStatus.data[0] == 0 &&  !overLimit)  );
    await switchLamp(bin.id,'RED',parseFloat(bin.weight) >= limit);
}
export const checkLampRed = async (io) => {
        try {
            const response = await axios.get(`http://${process.env.TIMBANGAN}/getbinData?hostname=${os.hostname()}`, { withCredentials: false,timeout: 1000 });
            const bin = response.data.bin;
            await triggerLampRed(bin);
        } catch (error) {
            console.log('Error fetching bin data');
            io.emit('refresh',true);
        }

        // Menambahkan delay untuk mencegah request yang berlebihan
//        await new Promise(resolve => setTimeout(resolve, 1000));
    
};

export const checkLampYellow = async () => {
    while (true) {
        try {
            const response = await axios.get(`http://${process.env.TIMBANGAN}/getbinData?hostname=${os.hostname()}`, { withCredentials: false });
            const bin = response.data;
            
            if (parseFloat(bin.weight) > parseFloat(bin.max_weight)) {
                await switchLamp(bin.id, 'YELLOW', false);
            } else {
                await switchLamp(bin.id, 'YELLOW', true);
            }
        } catch (error) {
            console.log('Error fetching bin data:', error);
        }

        // Menambahkan delay untuk mencegah request yang berlebihan
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};

export const startTransaction = async (req,res)=>{
    const {bin } = req.body;
    console.log('start-1-'+ new Date());
    await switchLamp(bin.id,"YELLOW",false);
    await switchLamp(bin.id,"GREEN",true);
    
    console.log('start-2-'+ new Date());
    const isCollection = bin.type == 'Collection';
    const lockId =  isCollection? 5: 4;
    const message =  isCollection ? "Buka Penutup Bawah" : "Buka Penutup Atas";
    await WriteCmd({id:1,address:lockId,value:1});
    runningTransaction.isRunning = true;
    io.emit('UpdateInstruksi',message);
    io.emit('GetType',bin.type);
    io.emit('Bin',bin);
    
    console.log('start-3-'+ new Date());
    return res.json({msg:"ok"});
}
export const endTransaction = async (req,res)=>{
    const {bin} = req.body;
    
    console.log('end-1-'+ new Date());
     await switchLamp(bin.id,"YELLOW",true);
     await switchLamp(bin.id,"GREEN",false);
    runningTransaction.isRunning = false;
    io.emit('Bin',bin);
    
    console.log('end-2-'+ new Date());
    if (bin.type == "Dispose")
    {
        io.emit("UpdateInstruksi", "DATA TELAH MASUK");
        setTimeout(()=>{
            io.emit('UpdateInstruksi','');
        },1000); 
    }
    else if (bin.type=='Collection')
    {
        await WriteCmd({id:1,address:5,value:1});
    }
    
    console.log('end-1-'+ new Date());
    return res.json({msg:"ok"});
}

export const receiveInstruksi = async (req,res) =>{
    const {instruksi} = req.body ;
    io.emit('UpdateInstruksi', instruksi);
    res.status(200).json({msg:'ok'});
}

export const receiveType = async (req,res) =>{
    const {type} = req.body ;
    io.emit('GetType', type);
    res.status(200).json({msg:'ok'});
}