import express from "express";
import ScalesRoute from "./routes/ScalesRoute.js";
import LockDoorRoute from "./routes/LockDoorRoute.js";
import LampRoute from "./routes/LampRoute.js";
import cors from  "cors";
import http from 'http';
import bodyParser from "body-parser";
import { checkLampRed,checkLampYellow, loadTransactionBin, triggerLampRed } from "./controllers/Bin.js";
import SensorRoute from "./routes/SensorRoute.js"
import APIRoute from './routes/APIRoute.js';
import { Server } from "socket.io";
import { observeSensor } from "./controllers/ActionSensor.js";
import { config } from "dotenv";
import { QueuePLC, SensorObserveQueue, serverAdapter } from "./lib/QueueUtil.js";
config()
const app = express();
const server = http.createServer(app);

const port = 5000;

app.use(cors({
  credentials: false,
  origin: '*'
}));
const io = new Server(server, {
  cors: {
    origin: "*"
  },
  
});

io.on('connection',(socket)=>{
    console.log("listening socket.io");
    socket.on('TriggerWeight',async (bin)=>{
      console.log(bin);
      await triggerLampRed(bin);
    })
  
});
app.use(cors({
  origin: '*', // Allow any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
/*  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers*/
  credentials:false 
}));

app.use(bodyParser.json());
app.use(ScalesRoute);
app.use(LockDoorRoute);
app.use(LampRoute);
app.use(SensorRoute);
app.use(APIRoute);

app.use('/queues',serverAdapter.getRouter());
server.listen(port,async () => {
  loadTransactionBin();
  SensorObserveQueue.add({type:'observe'},{
    removeOnFail:{count:10},timeout:3000,removeOnComplete:{count:5}
  });
  console.log(`Server up and running on port ${port}`);
});
//observeSensor(io);
const runningTransaction = {isRunning:false,type: null,topSensor:null,bottomSensor:null,isReady:true,allowReopen:false};

export {io,runningTransaction};
