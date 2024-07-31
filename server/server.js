const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const { exec } = require("child_process");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.REACT_APP_API_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("join room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user joined", socket.id);
  });

  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeChange", { code });
  });

  socket.on("execute code", ({ code, language }) => {
    // TODO: Implement proper sandboxing for code execution
    exec(`node -e "${code}"`, (error, stdout, stderr) => {
      socket.emit("code execution result", { output: stdout, error: stderr });
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  // TODO: Implement video chat socket events
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: ${process.env.REACT_APP_API_URL}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});
