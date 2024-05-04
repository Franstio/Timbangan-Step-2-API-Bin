import express from "express";
import ScalesRoute from "./routes/ScalesRoute.js";
import cors from  "cors";
import http from 'http';
import { Server } from "socket.io";
import ModbusRTU from 'modbus-serial';

const client = new ModbusRTU();


const app = express();
const server = http.createServer(app);

const port = 5000;

app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000'
}));

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000"
  }
});

export { Server, io };

app.use(ScalesRoute);


client.connectRTU("/dev/ttyUSB0", { baudRate: 9600 })
  .then(() => {
    console.log("Connected to PLC via Modbus RTU over USB.");
    
  })
  .catch((err) => {
    console.error("Error connecting to PLC:", err);
  });


server.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
