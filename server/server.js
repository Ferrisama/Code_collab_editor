const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;

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
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server
  .listen(PORT, () => console.log(`Server running on port ${PORT}`))
  .on("error", (error) => {
    if (error.syscall !== "listen") {
      throw error;
    }
    switch (error.code) {
      case "EACCES":
        console.error(`Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(`Port ${PORT} is already in use`);
        server.listen(0, () => {
          console.log(`Server running on port ${server.address().port}`);
        });
        break;
      default:
        throw error;
    }
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
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinRoom", (projectId) => {
    socket.join(projectId);
    console.log(`Client joined room ${projectId}`);
  });

  socket.on("codeChange", async ({ roomId, code }) => {
    socket.to(roomId).emit("codeUpdate", code);

    // Update the project in the database
    try {
      await Project.findByIdAndUpdate(roomId, { content: code });
    } catch (error) {
      console.error("Error updating project:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
