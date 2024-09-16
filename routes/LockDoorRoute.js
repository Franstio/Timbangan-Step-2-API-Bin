import express from "express";
import {lockTop,lockBottom, getHostname, getIp, getTransactionStatus} from "../controllers/TriggerLock.js"

const router = express.Router();

router.post('/locktop', lockTop);
router.post('/lockbottom', lockBottom);
router.get('/hostname',getHostname);
router.get('/ip',getIp);
router.get('/status',getTransactionStatus)
export default router;