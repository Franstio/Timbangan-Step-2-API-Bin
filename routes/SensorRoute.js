import express from "express";
import {SensorTop,SensorBottom, observeBottomSensor,observeTopSensor} from "../controllers/ActionSensor.js"
import { receiveInstruksi, receiveType } from "../controllers/Bin.js";

const router = express.Router();

router.post('/sensortop', SensorTop);
router.post('/sensorbottom', SensorBottom);
router.post('/instruksi',receiveInstruksi);
router.post('/type',receiveType);
router.post('/observeBottomSensor',observeBottomSensor);
router.post('/observeTopSensor', observeTopSensor)
export default router;