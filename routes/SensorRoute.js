import express from "express";
import {SensorTop,SensorBottom} from "../controllers/ActionSensor.js"

const router = express.Router();

router.post('/sensortop', SensorTop);
router.post('/sensorbottom', SensorBottom);

export default router;