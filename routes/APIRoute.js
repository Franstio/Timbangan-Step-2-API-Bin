import express from "express";
import { clearTransactionBin, endTransaction, endTransactionAPI, startTransaction, startTransactionAPI, stopReopen } from "../controllers/Bin.js";

const router = express.Router();

router.post('/Start',startTransactionAPI);
router.post('/End',endTransactionAPI);
router.get('/clear-bin',async (req,res)=>{await clearTransactionBin();return res.json({msg:"ok"});})
router.get('/reopen-close',stopReopen);
export default router;