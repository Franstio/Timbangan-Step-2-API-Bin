import express from "express";
import {lockTop,lockBottom, getHostname} from "../controllers/TriggerLock.js"

const router = express.Router();

router.post('/locktop', lockTop);
router.post('/lockbottom', lockBottom);
router.get('/hostname',getHostname);

export default router;