import express from "express";
/* import {getScales50Kg} from "../controllers/Scales.js" */
import { controlLock } from "../controllers/TriggerLock.js";

const router = express.Router();

/* router.get('/Scales4Kg',  getScales4Kg); */
/* router.get('/Scales50Kg', getScales50Kg); */
router.post('/controlLock', controlLock);


export default router;