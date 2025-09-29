const socket = io("http://localhost:5000");

const chatMessages = document.getElementById("chat-messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");

let typingTimeout;

// ✅ Ask username once when page loads
const username = prompt("Enter your name:") || "Anonymous";
socket.emit("setUsername", username);


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

// ✅ Typing event
messageInput.addEventListener("input", () => {
  socket.emit("typing");
});

// ✅ Send message
sendBtn.addEventListener("click", () => {
  const text = messageInput.value.trim();
  if (text) {
    // send only message, backend will attach username
    socket.emit("chatMessage", text);
    addMessage(`${username}: ${text}`, "sent"); // show your own msg with your name
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
  addMessage(`${msg.username}: ${msg.message}`, "received");
});

// ✅ Receive chat history when joining
socket.on("chatHistory", (messages) => {
  messages.forEach((msg) => {
    addMessage(`${msg.username}: ${msg.message}`, "received");
  });
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
