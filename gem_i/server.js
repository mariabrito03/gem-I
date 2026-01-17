import express from "express";
import http from "http";
import { Server } from "socket.io";
import TelegramBot from "node-telegram-bot-api";
import cors from "cors";

// ------------------ VARIABLES DE ENTORNO ------------------
const TOKEN = process.env.TOKEN;       // Telegram Bot Token
const CHAT_ID = process.env.CHAT_ID;   // ChatID fijo para recibir todos los mensajes
const PORT = process.env.PORT || 3000;

// ------------------ EXPRESS ------------------
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",   // Permite cualquier origen para pruebas
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ------------------ TELEGRAM ------------------
const bot = new TelegramBot(TOKEN, { polling: true });

// Recibir mensaje desde Telegram
bot.on("message", (msg) => {
  console.log("Mensaje recibido de Telegram:", msg.text);
  io.emit("nuevoMensaje", { text: msg.text });
});

// ------------------ ENDPOINT para mensajes desde la web ------------------
app.post("/send-message", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ status: "error", error: "Mensaje vacío" });

  bot.sendMessage(CHAT_ID, text)
    .then(() => res.json({ status: "ok" }))
    .catch(err => res.status(500).json({ status: "error", error: err.message }));
});

// ------------------ SOCKET.IO ------------------
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);
});

// ------------------ START SERVER ------------------
server.listen(PORT, () => {
  console.log(`Servidor Node.js corriendo en puerto ${PORT}`);
});

// ================= PUERTO =================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listo en puerto ${PORT}`));

