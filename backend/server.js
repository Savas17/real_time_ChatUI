import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { db } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

// ✅ Get all messages
app.get("/messages", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM messages ORDER BY timestamp ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

io.on("connection", (socket) => {
  console.log("🟢 User connected");

  socket.on("chatMessage", async (text) => {
    try {
      await db.query("INSERT INTO messages (text) VALUES (?)", [text]);
      io.emit("chatMessage", { text });
    } catch (err) {
      console.error("❌ DB insert failed:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
