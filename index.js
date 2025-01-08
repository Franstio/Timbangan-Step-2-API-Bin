import express from "express";
import ScalesRoute from "./routes/ScalesRoute.js";
import LockDoorRoute from "./routes/LockDoorRoute.js";
import LampRoute from "./routes/LampRoute.js";
import cors from  "cors";
import http from 'http';
import bodyParser from "body-parser";
import { checkLampRed,checkLampYellow, triggerLampRed } from "./controllers/Bin.js";
import SensorRoute from "./routes/SensorRoute.js"
import APIRoute from './routes/APIRoute.js';
import { Server } from "socket.io";
import { observeSensor } from "./controllers/ActionSensor.js";
import { config } from "dotenv";
import { SensorObserveQueue, serverAdapter } from "./lib/QueueUtil.js";
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
server.listen(port, () => {
  SensorObserveQueue.add({type:'observe'},{
    repeat: {every: 1000},removeOnFail:{age: 60*10,count:10},timeout:3000,removeOnComplete:{age:60,count:5}
  });
  console.log(`Server up and running on port ${port}`);
});
//observeSensor(io);
const runningTransaction = {isRunning:false,type: null};
export {io,runningTransaction};
