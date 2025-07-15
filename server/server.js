const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Socket.io
io.on("connection", (socket) => {
  console.log("New client connected: " + socket.id);

  socket.on("join-doc", (docId) => {
    socket.join(docId);
  });

  socket.on("send-changes", ({ docId, delta }) => {
    socket.to(docId).emit("receive-changes", delta);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: " + socket.id);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => server.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => console.log(err));
