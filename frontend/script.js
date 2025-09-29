const socket = io("http://localhost:5000");

const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");

let typingTimeout;

// ✅ Smooth scroll to bottom
function scrollToBottom() {
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: "smooth",
  });
}

// ✅ Add message with timestamp
function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.classList.add("message", type);

  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  msg.innerHTML = `
    <span>${text}</span>
    <span class="time">${time}</span>
  `;

  chatMessages.appendChild(msg);
  scrollToBottom();
}

// ✅ Load old messages
async function loadMessages() {
  try {
    const res = await fetch("http://localhost:5000/messages");
    if (!res.ok) throw new Error("Failed to fetch messages");
    const data = await res.json();
    data.forEach(m => addMessage(m.text, "received"));
  } catch (err) {
    console.error("❌ Could not load messages:", err.message);
    addMessage("⚠️ Failed to load chat history", "received");
  }
}

// ✅ Typing event
messageInput.addEventListener("input", () => {
  socket.emit("typing");
});

// ✅ Send message
sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (text) {
    socket.emit("chatMessage", text);
    addMessage(text, "sent");
    messageInput.value = "";
    socket.emit("stopTyping");
  }
});

// ✅ Enter key support
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendBtn.click();
});

// ✅ Receive messages
socket.on("chatMessage", msg => {
  addMessage(msg.text, "received");
});

// ✅ Show typing indicator
socket.on("typing", () => {
  typingIndicator.style.display = "block";
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typingIndicator.style.display = "none";
  }, 2000);
});

// ✅ Hide typing indicator if stopped
socket.on("stopTyping", () => {
  typingIndicator.style.display = "none";
});

// ✅ Connection events
socket.on("connect", () => console.log("🟢 Connected to server"));
socket.on("connect_error", (err) => {
  console.error("❌ Socket connection failed:", err.message);
  addMessage("⚠️ Unable to connect to server", "received");
});

// Load messages when page loads
loadMessages();
