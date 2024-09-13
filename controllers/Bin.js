import axios from 'axios';
import client from './plcClient.js';
import os from 'os';
import { io } from '../index.js';
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
        client.setTimeout(3000);
        client.setID(data.id);
        await client.writeRegister(data.address,data.value);
        return;
    }
    catch(err)
    {
        await new Promise((resolve) => setTimeout(resolve,100));
        await WriteCmd(data);
    }
}
export const checkLampRed = async () => {
        try {
            const response = await axios.get(`http://${process.env.TIMBANGAN}/getbinData?hostname=${os.hostname()}`, { withCredentials: false,timeout: 1000 });
            const bin = response.data.bin;
            const limit = (parseFloat(bin.max_weight) /100) * 90;
            const greenStatus = await ReadCmd(8,1);
            const overLimit = parseFloat(bin.weight) >= parseFloat(bin.max_weight); 
            console.log({weight:bin.weight,limit:limit,status: parseFloat(bin.weight) >= limit});
            await switchLamp(bin.id, 'YELLOW', (greenStatus.data[0] == 0 &&  !overLimit)  );
            await switchLamp(bin.id,'RED',parseFloat(bin.weight) >= limit);
        } catch (error) {
            console.log('Error fetching bin data');
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