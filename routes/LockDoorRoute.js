import express from "express";
import {lockTop} from "../controllers/TriggerLock.js"

const router = express.Router();

router.post('/locktop', lockTop);


export default router;