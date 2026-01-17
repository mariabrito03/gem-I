// server.js
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import TelegramBot from "node-telegram-bot-api";

// ================= CONFIG =================
const TOKEN = process.env.TOKEN;        // TOKEN del bot desde variables de entorno
const CHAT_ID = process.env.CHAT_ID;    // Chat ID fijo desde variables de entorno

if (!TOKEN || !CHAT_ID) {
  console.error("ERROR: TOKEN o CHAT_ID no definido en variables de entorno.");
  process.exit(1);
}

// ================= EXPRESS + SOCKET.IO =================
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",  // Puedes restringirlo a tu dominio final
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // carpeta de tu frontend

// ================= TELEGRAM BOT =================
const bot = new TelegramBot(TOKEN, { polling: true });

bot.on("message", (msg) => {
  console.log("Mensaje recibido de Telegram:", msg.text);
  console.log("Chat ID:", msg.chat.id);

  // Emitir al frontend
  io.emit("nuevoMensaje", { chatId: msg.chat.id, text: msg.text });
});

// ================= ENDPOINT PARA MENSAJES DESDE LA WEB =================
app.post("/send-message", (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ status: "error", error: "message text is empty" });
  }

  bot.sendMessage(CHAT_ID, text)
    .then(() => res.json({ status: "ok", chatId: CHAT_ID }))
    .catch(err => res.status(500).json({ status: "error", error: err.message }));
});

// ================= SOCKET.IO =================
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// ================= PUERTO =================
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(` Servidor Node.js corriendo en puerto ${PORT}`);
});

// ======================= KEEP ALIVE =======================
setInterval(() => {
  fetch("https://authentic-dream-production-a737.up.railway.app")
    .then(() => console.log("Keep-alive ping"))
    .catch(() => {});
}, 240000); // 4 minutos



