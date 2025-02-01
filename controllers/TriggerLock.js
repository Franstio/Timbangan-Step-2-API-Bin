
import os,{networkInterfaces} from 'os';
import { pushPayloadData } from './ActionSensor.js';
import { client } from '../lib/PLCUtil.js';
import { runningTransaction } from '../index.js';
import { saveTransactionBin } from './Bin.js';

export const lockTop = async (req, res) => {
    let c = 0;
    let err = '';
    do{
    try {
        const {idLockTop} = req.body;

       /*client.setID(idLockTop);
        if (!client.isOpen) {
            client.open( () => {
           });
        }*/
        const address = 4;
        const value = 1;
//        const log = await client.writeRegister(address,value);
        runningTransaction.allowReopen = false;
        await saveTransactionBin();
        pushPayloadData({id:idLockTop,address:address,value:value});
        console.log("Top Lock Dibuka - " + new Date().toLocaleString());
//        await new Promise(resolve => setTimeout(function () { return resolve(); }, 100));
//        const data = await client.readHoldingRegisters(address, 8);
       /*  if (value === 1) {
            res.status(200).json({ msg: `Top Lock diBuka` });
        } else {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil ditutup.` });
        } */
        return res.status(200).json({ msg: `Top Lock Dibuka`,c:c });

    } catch (error) {
        err =  error;
        c =c+1;
    }
    }
    while (c < 10);
    return res.status(500).json({ msg: err ,from: 'Lock Top'});
    
};

export const lockBottom = async (req, res) => {
    let c= 0;
    let err='';
    do
    {
    try {
        const {idLockBottom} = req.body;

      /* client.setID(idLockBottom);
        if (!client.isOpen) {
            client.open( () => {
           });
        }*/
        const address = 5;
        const value = 1;
        runningTransaction.allowReopen = false;
        await saveTransactionBin();
        //const log = await client.writeRegister(address,value);));
        pushPayloadData({id:idLockBottom,address:address,value:value});
//        await new Promise(resolve => setTimeout(function () { return resolve(); }, 100
//        const data = await client.readHoldingRegisters(address, 8);
       /*  if (value === 1) {
            res.status(200).json({ msg: `Top Lock diBuka` });
        } else {
            res.status(200).json({ msg: `Kunci dengan address ${address} berhasil ditutup.` });
        } */
        return res.status(200).json({ msg: `Bottom Lock diBuka`,c: c });

    } catch (error) {
        err = error;
        c = c+1;
    }
    }
    while (c < 10);
    return res.status(500).json({ msg: err,from: 'Lock Bottom' });
};

export const getHostname = async (req,res) =>{
    res.status(200).json({hostname: os.hostname()});
}

export const getTransactionStatus = (req,res) =>
{
    return res.status(200).json(runningTransaction);
}

export const getIp = (req,res)=>{
    const nets = networkInterfaces();
    const results = Object.create({});

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
    
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
            }
        }
    }
    let result = results;
    if (process.env.ETH_INTERFACE)
        result = results[process.env.ETH_INTERFACE];
    return res.status(200).json(result);
}