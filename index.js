import express from "express";
import ScalesRoute from "./routes/ScalesRoute.js";
import LockDoorRoute from "./routes/LockDoorRoute.js";
import LampRoute from "./routes/LampRoute.js";
import cors from  "cors";
import http from 'http';
import { Server } from "socket.io";
import bodyParser from "body-parser";
// import { getWeightBin } from "../New-Sealable-Api/controllers/Bin.js";

const app = express();
const server = http.createServer(app);

const port = 5000;

app.use(cors({
  credentials: false,
  origin: '*'
}));

// const io = new Server(server, {
//   cors: {
//     origin: "*"
//   }
// });

app.use(bodyParser.json());
app.use(ScalesRoute);
app.use(LockDoorRoute);
app.use(LampRoute);

server.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});

// export { Server, io };