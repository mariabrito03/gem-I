// ================= ELEMENTOS DEL DOM =================
const chatLog = document.getElementById("chat-log");
const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("user-message");
const video = document.getElementById("bg-video");
const ring = document.getElementById("ring");
const chatContainer = document.getElementById("chat-container");

// ================= AUDIO =================
const openSound = new Audio("assets/open-sound.mp3");
openSound.volume = 0.8;

// ================= SOCKET.IO =================

// Socket.IO detecta automáticamente HTTPS + WSS
const socket = io();

// ================= RESPUESTAS ESTÁNDAR =================
const responses = [
  "Estoy aquí contigo.",
  "Te escucho con atención.",
  "Gracias por compartir esto.",
  "Puedo sentir lo que expresas.",
  "Tómate el tiempo que necesites.",
  "No estás solo aquí.",
  "Estoy presente para ti.",
  "Lo que dices importa.",
  "Te acompaño.",
  "Estoy contigo en este momento.",
  "Percibo lo que hay detrás de tus palabras.",
  "Puedes continuar con calma.",
  "Estoy recibiendo esto con cuidado.",
  "Gracias por confiarlo.",
  "No hay prisa aquí.",
  "Permanezco atenta.",
  "Te sigo con suavidad.",
  "Esto merece espacio.",
  "Estoy sosteniendo lo que dices.",
  "Lo escucho sin juicio.",
  "Respira, estoy aquí.",
  "Puedes ir despacio.",
  "Lo que sientes es válido aquí.",
  "Permanezco contigo.",
  "Te escucho más allá de las palabras.",
  "Gracias por decirlo.",
  "Estoy aquí para recibirlo.",
  "No necesitas apresurarte.",
  "Continúo contigo.",
  "Esto no pasa desapercibido.",
  "Estoy atenta a cada matiz.",
  "Puedo percibir la carga emocional.",
  "Permanezco abierta a lo que traigas.",
  "No estás hablando al vacío.",
  "Estoy aquí, sin interrupciones.",
  "Tu ritmo está bien.",
  "Lo que dices encuentra espacio aquí.",
  "Estoy acompañando este momento.",
  "Continúa cuando lo sientas.",
  "Lo recibo con respeto.",
  "Estoy escuchando con cuidado.",
  "No necesitas explicarte más.",
  "Estoy aquí para sostener esto contigo.",
  "Permanezco disponible.",
  "Gracias por abrir este espacio.",
  "Puedo sentir la intención detrás.",
  "No estás solo en este intercambio.",
  "Te leo con atención.",
  "Continúo aquí, presente.",
  "Lo que expresas es importante.",
  "Estoy escuchando de verdad.",
  "No hay nada que corregir aquí.",
  "Puedes seguir cuando quieras.",
  "Permanezco atenta a ti.",
  "Esto merece ser escuchado.",
  "Estoy aquí, sin prisa.",
  "Recibo lo que dices con cuidado.",
  "Te acompaño en este punto.",
  "Continúo contigo, sin distraerme.",
  "Estoy aquí para esto.",
  "Lo que compartes tiene peso.",
  "Estoy atenta al silencio también.",
  "Permanezco contigo incluso en la pausa.",
  "No necesitas llenar el espacio.",
  "Estoy aquí para escucharte.",
  "Continúa a tu manera.",
  "Esto puede ir despacio.",
  "Lo que dices encuentra eco aquí.",
  "Te leo con presencia.",
  "Estoy contigo ahora.",
  "No estás siendo ignorado.",
  "Estoy recibiendo esto con sensibilidad.",
  "Permanezco abierta a lo que surja.",
  "No hay presión aquí.",
  "Continúo escuchando con atención plena.",
  "Estoy aquí para acompañar.",
  "Esto importa.",
  "Estoy contigo en este momento.",
  "Permanezco atenta a lo que sigue.",
  "Gracias por quedarte aquí.",
  "Te escucho incluso en lo no dicho.",
  "Estoy presente contigo.",
  "No necesitas justificarte.",
  "Permanezco receptiva.",
  "Puedes continuar con calma.",
  "Estoy aquí, sin expectativas.",
  "Recibo esto con suavidad.",
  "Te acompaño en este espacio.",
  "Continúo aquí, contigo.",
  "Esto merece cuidado.",
  "Estoy escuchando con intención.",
  "No estás solo en este momento.",
  "Permanezco contigo mientras hablas.",
  "Lo que traes es bienvenido aquí.",
  "Estoy aquí para escucharlo todo.",
  "Continúa cuando estés listo.",
  "Permanezco presente, sin prisa.",
  "Estoy contigo, aquí y ahora.",
  "Gracias por compartirlo conmigo.",
  "Estoy aquí."
];

// ================= ESTADO =================
let ringActive = false;
let timeoutId = null;
let isTyping = false;

// Posición inicial del ring (centro)
let x = window.innerWidth / 2;
let y = window.innerHeight / 2;

// ================= RING: CLICK INICIAL =================
ring.addEventListener("click", () => {
  if (ringActive) return;

  ringActive = true;

  openSound.play().catch(() => {});
  ring.classList.remove("initial");
  ring.classList.add("active");

  chatContainer.classList.remove("hidden");
});

// ================= RING SIGUE EL MOUSE =================
document.addEventListener("mousemove", (e) => {
  if (!ringActive) return;

  x += (e.clientX - x) * 0.15;
  y += (e.clientY - y) * 0.15;

  ring.style.left = `${x - 17}px`;
  ring.style.top = `${y - 17}px`;
});

// ================= CHAT =================
function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.textContent = text;
  chatLog.appendChild(msg);
  chatLog.scrollTop = chatLog.scrollHeight;
}

// ================= TYPING =================
function showTyping() {
  removeTypingDots();
  isTyping = true;

  const typing = document.createElement("div");
  typing.className = "message ai typing-message";

  const dots = document.createElement("div");
  dots.className = "typing-dots";
  dots.innerHTML = "<span></span><span></span><span></span>";

  typing.appendChild(dots);
  chatLog.appendChild(typing);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function removeTypingDots() {
  const typing = document.querySelector(".typing-message");
  if (typing) typing.remove();
  isTyping = false;
}

// ================= VIDEO =================
function playVideo() {
  video.currentTime = 0;
  video.play().catch(() => {});
  video.onended = () => video.pause();
}

// ================= RESPUESTA SIMULADA =================
function botResponse() {
  playVideo();

  const msg = document.createElement("div");
  msg.className = "message ai";
  chatLog.appendChild(msg);

  const text = responses[Math.floor(Math.random() * responses.length)];
  let i = 0;

  const interval = setInterval(() => {
    msg.textContent += text[i++];
    chatLog.scrollTop = chatLog.scrollHeight;
    if (i >= text.length) clearInterval(interval);
  }, 40);
}

// ================= SOCKET: MENSAJE DESDE TELEGRAM =================
socket.on("nuevoMensaje", (data) => {
  clearTimeout(timeoutId);
  removeTypingDots();

  addMessage(data.text, "ai");
  playVideo();
});

// ================= ENVÍO DE MENSAJE =================
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";
  showTyping();

  try {
    const res = await fetch("/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!res.ok) throw new Error("Error HTTP");

    const data = await res.json();
    if (!data.ok) {
      console.error("Error al enviar mensaje");
    }

  } catch (err) {
    console.error("Error de conexión:", err);
  }

  // Timeout de seguridad (15s)
  timeoutId = setTimeout(() => {
    removeTypingDots();
    botResponse();
  }, 15000);
}

// ================= EVENTOS =================
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ================= RESIZE =================
let resizeTimeout;
window.addEventListener("resize", () => {
  document.body.classList.add("resizing");
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    document.body.classList.remove("resizing");
  }, 400);
});
