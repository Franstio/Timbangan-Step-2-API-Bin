import express from "express";
import ScalesRoute from "./routes/ScalesRoute.js";
import LockDoorRoute from "./routes/LockDoorRoute.js";
import LampRoute from "./routes/LampRoute.js";
import cors from  "cors";
import http from 'http';
import bodyParser from "body-parser";
import { checkLampRed,checkLampYellow } from "./controllers/Bin.js";

const app = express();
const server = http.createServer(app);

const port = 5000;

app.use(cors({
  credentials: false,
  origin: '*'
}));

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

server.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
checkLampRed();
checkLampYellow();

