import { pushPayloadData } from "./ActionSensor.js";
import client from "./plcClient.js";
client.setTimeout(5000);

export const REDLampOn = async (req, res) => {
    try {
        const { idLockTop } = req.body;

        const address = 6;
        const value = 1;
        pushPayloadData({id:idLockTop,address:address,value:value});

        res.status(200).json({ msg: `Lampu Merah Menyala` });

    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

export const REDLampOff = async (req, res) => {
    try {
        const { idLockTop } = req.body;

        if (!client.isOpen) {
            client.open(() => {
            });
        }
        const address = 6;
        const value = 0;
        pushPayloadData({id:idLockTop,address:address,value:value});
        res.status(200).json({ msg: `Lampu Merah Mati` });

    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

export const YELLOWLampOn = async (req, res) => {
    try {
        const { idLampYellow } = req.body;

        client.setID(idLampYellow);
        if (!client.isOpen) {
            client.open(() => {
            });
        }
        const address = 7;
        const value = 1;
        
        pushPayloadData({id:idLampYellow,address:address,value:value});
        res.status(200).json({ msg: `Lampu Kuning Menyala` });

    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

export const YELLOWLampOff = async (req, res) => {
    try {
        const { idLampYellow } = req.body;

        client.setID(idLampYellow);
        if (!client.isOpen) {
            client.open(() => {
            });
        }
        const address = 7;
        const value = 0;
        pushPayloadData({id:idLampYellow,address:address,value:value});

        res.status(200).json({ msg: `Lampu Kuning Mati` });

    } catch (error) {
        res.status(500).json({ msg: error });
    }
};

export const GREENLampOn = async (req, res) => {
    let _continue = false;
    let _try = 0;
    let err=undefined;
    do 
    {
    try {

        const { idLampGreen } = req.body;
        client.setID(idLampGreen);
        if (!client.isOpen) {
            client.open(() => {
            });
        }
        const address = 8;
        const value = 1;
        
        pushPayloadData({id:idLampGreen,address:address,value:value});
        err = undefined;
        _continue = false;

    } catch (error) {
        err = error;
        _continue=true;
        _try = _try+1;
    }
    }
    while (_continue && _try <10 );
    return err ? res.status(500).json({msg:err}) : res.status(200).json({msg:"Lampu Hijau Menyala"});
};

export const GREENLampOff = async (req, res) => {
    let _continue = false;
    let _try = 0;
    let err=undefined;
    do 
    {
    try {

        const { idLampGreen } = req.body;
        client.setID(idLampGreen);
        if (!client.isOpen) {
            client.open(() => {
            });
        }
        const address = 8;
        const value = 0;
        pushPayloadData({id:idLampGreen,address:address,value:value});
        err = undefined;
        _continue = false;


    } catch (error) {
        err = error;
        _continue=true;
        _try = _try+1;
    }
    }
    while (_continue && _try <10 );
    return err ? res.status(500).json({msg:err}) : res.status(200).json({msg:"Lampu Hijau Mati"});
};

export const switchLamp = async (id, lampType, isAlive) => {
    const dict = {
        "RED": 6,
        "GREEN": 8,
        "YELLOW": 7
    };
    const address = dict[lampType];
    try {
        pushPayloadData({id:id,address:address,value: isAlive ? 1 : 0});
    }
    catch (error) {
    }
}