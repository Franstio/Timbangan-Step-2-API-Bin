import express from "express";
import { endTransaction, startTransaction } from "../controllers/Bin";

const router = express.Router();

router.post('/Start',startTransaction);
router.post('/End',endTransaction);

export default router;