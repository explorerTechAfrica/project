import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 10000;

// ---- MJPEG OR WEBSOCKET RELAY BUFFER ----
let lastFrame = null;

// ---- WEBSOCKET SERVER (Render accepts WS on same port) ----
const wss = new WebSocketServer({ noServer: true });
wss.on("connection", (ws) => {
  console.log("Frontend connected to WebSocket");

  // If we already have a frame, send it immediately
  if (lastFrame) {
    ws.send(lastFrame);
  }
});

// ---- HTTP UPGRADE HANDLER FOR RENDER ----
const server = app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

server.on("upgrade", (req, socket, head) => {
  if (req.url === "/stream") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  }
});

// ---- ENDPOINT: Raspberry Pi pushes MJPEG frames ----
app.post("/push-frame", express.raw({ type: "image/jpeg", limit: "5mb" }), (req, res) => {
  lastFrame = req.body;        // save latest frame
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(lastFrame);  // broadcast to all frontends
    }
  });
  res.sendStatus(200);
});

// ---- SIMPLE HEALTH TEST ----
app.get("/", (req, res) => res.send("Video middleware active."));
