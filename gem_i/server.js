const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const TelegramBot = require("node-telegram-bot-api");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // <- public folder

const server = http.createServer(app);
const io = new Server(server);

// ================= TELEGRAM =================
const TOKEN = process.env.TOKEN;      // desde Plesk Environment Variables
const CHAT_ID = process.env.CHAT_ID;  // desde Plesk Environment Variables

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on("message", (msg) => {
  console.log("Mensaje recibido de Telegram:", msg.text);
  io.emit("nuevoMensaje", { text: msg.text });
});

// ================= RUTAS =================
app.post("/send-message", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ status: "error", error: "Texto vacío" });

  bot.sendMessage(CHAT_ID, text)
    .then(() => res.json({ status: "ok" }))
    .catch(err => res.status(500).json({ status: "error", error: err.message }));
});

// ================= SOCKET.IO =================
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);
});

// ================= PUERTO =================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listo en puerto ${PORT}`));
