import express from "express";
import { clearTransactionBin, endTransaction, startTransaction } from "../controllers/Bin.js";

const router = express.Router();

router.post('/Start',startTransaction);
router.post('/End',endTransaction);
routes.get('/clear-bin',async (req,res)=>{await clearTransactionBin();return res.json({msg:"ok"});})

export default router;