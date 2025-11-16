import express from "express";
import { REDLampOn,REDLampOff, GREENLampOn, GREENLampOff, YELLOWLampOn, YELLOWLampOff, LampSet } from "../controllers/TriggerLamp.js";

const router = express.Router();

router.post('/redlampon', REDLampOn);
router.post('/redlampoff',REDLampOff);
router.post('/yellowlampon',YELLOWLampOn);
router.post('/yellowlampoff',YELLOWLampOff);
router.post('/greenlampon', GREENLampOn);
router.post('/greenlampoff',GREENLampOff);
router.get('/lamp',LampSet);
export default router;