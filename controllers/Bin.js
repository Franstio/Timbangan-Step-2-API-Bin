import axios from 'axios';
import client from './plcClient.js';
import os from 'os';
import { io } from '../index.js';

export const switchLamp = async (id, lampType, isAlive) => {
    const dict = {
        "RED": 6,
        "YELLOW":7,
        "GREEN": 8
    };
    const address = dict[lampType];
    client.setID(1);
    try {
        await client.writeRegister(address, isAlive ? 1 : 0);
    }
    catch (error) {
        console.log([error, id, lampType, address, isAlive]);
    }
    await new Promise(resolve => setTimeout(function () { return resolve(); }, 10));
};

export const checkLampRed = async () => {
        try {
            const response = await axios.get(`http://2-PCL.local:5000/getbinData?hostname=${os.hostname()}`, { withCredentials: false });
            const bin = response.data.bin;
                
            console.log({ weight :bin.weight,max:bin.max_weight });
            const limit = (parseFloat(bin.max_weight) /100) * 100;
            if (bin && parseFloat(bin.weight) >= limit) {
                //console.log("Turn on Red");
                await switchLamp(bin.id, 'RED', true);
                await switchLamp(bin.id, 'YELLOW', false);
            } else {
                //console.log("Turn off Red");
                await switchLamp(bin.id, 'RED', false);
                await switchLamp(bin.id, 'YELLOW', true);
            }
        } catch (error) {
            console.error('Error fetching bin data:', error);
        }

        // Menambahkan delay untuk mencegah request yang berlebihan
//        await new Promise(resolve => setTimeout(resolve, 1000));
    
};

export const checkLampYellow = async () => {
    while (true) {
        try {
            const response = await axios.get(`http://2-PCL.local:5000/getbinData?hostname=${os.hostname()}`, { withCredentials: false });
            const bin = response.data;
            console.log({ binFromApi: bin });
            
            if (parseFloat(bin.weight) > parseFloat(bin.max_weight)) {
                await switchLamp(bin.id, 'YELLOW', false);
            } else {
                await switchLamp(bin.id, 'YELLOW', true);
            }
        } catch (error) {
            console.error('Error fetching bin data:', error);
        }

        // Menambahkan delay untuk mencegah request yang berlebihan
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
};




export const receiveInstruksi = async (req,res) =>{
    const {instruksi} = req.body ;
    console.log({instruksi:instruksi});
    io.emit('UpdateInstruksi', instruksi);
    res.status(200).json({msg:'ok'});
}

export const receiveType = async (req,res) =>{
    const {type} = req.body ;
    console.log({type:type});
    io.emit('GetType', type);
    res.status(200).json({msg:'ok'});
}