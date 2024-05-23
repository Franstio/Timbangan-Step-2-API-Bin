import express from "express";
import { REDLampOn,REDLampOff, GREENLampOn, GREENLampOff, YELLOWLampOn, YELLOWLampOff } from "../controllers/TriggerLamp.js";

const router = express.Router();

router.post('/redlampon', REDLampOn);
router.post('/redlampoff',REDLampOff);
router.post('/yellowlampon',YELLOWLampOn);
router.post('/yellowlampoff',YELLOWLampOff);
router.post('/greenlampon', GREENLampOn);
router.post('/greenlampoff',GREENLampOff);

export default router;