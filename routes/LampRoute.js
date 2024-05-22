import express from "express";
import { REDLampOn,REDLampOff } from "../controllers/TriggerLamp.js";

const router = express.Router();

router.post('redlampon', REDLampOn);
router.post('redlampoff',REDLampOff);

export default router;