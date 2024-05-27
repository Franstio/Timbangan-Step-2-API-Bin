import axios from 'axios';
import client from '../controllers/TriggerLock.js';
import os from 'os';

export const switchLamp = async (id, lampType, isAlive) => {
    const dict = {
        "RED": 8,
        "YELLOW":7,
        "GREEN": 6
    };
    const address = dict[lampType];
    client.setID(1);
    try {
        await client.writeRegister(address, isAlive ? 1 : 0);
    }
    catch (error) {
        console.log([error, id, lampType, address, isAlive]);
    }
    await new Promise(resolve => setTimeout(function () { return resolve(); }, 2000));
};

export const checkLampRed = async () => {
    while (true) {
        try {
            const response = await axios.get(`http://pcs.local:5000/getbinData?hostname=${os.hostname()}`, { withCredentials: false });
            const bin = response.data;
            console.log({ binFromApi: bin });
            
            if (parseFloat(bin.weight) >= parseFloat(bin.max_weight)) {
                await switchLamp(bin.id, 'RED', true);
            } else {
                await switchLamp(bin.id, 'RED', false);
            }
        } catch (error) {
            console.error('Error fetching bin data:', error);
        }

        // Menambahkan delay untuk mencegah request yang berlebihan
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
};

export const checkLampYellow = async () => {
    while (true) {
        try {
            const response = await axios.get(`http://pcs.local:5000/getbinData?hostname=${os.hostname()}`, { withCredentials: false });
            const bin = response.data;
            console.log({ binFromApi: bin });
            
            if (parseFloat(bin.weight) >= parseFloat(bin.max_weight)) {
                await switchLamp(bin.id, 'YELLOW', false);
            } else {
                await switchLamp(bin.id, 'YELLOW', true);
            }
        } catch (error) {
            console.error('Error fetching bin data:', error);
        }

        // Menambahkan delay untuk mencegah request yang berlebihan
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
};