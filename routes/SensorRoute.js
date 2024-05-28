import express from "express";
import {SensorTop,SensorBottom} from "../controllers/ActionSensor.js"
import { receiveInstruksi } from "../controllers/Bin.js";

const router = express.Router();

router.post('/sensortop', SensorTop);
router.post('/sensorbottom', SensorBottom);
router.post('/instruksi',receiveInstruksi);
export default router;