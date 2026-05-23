const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();
// A. Express Gateway CORS Configuration
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ 
  origin: allowedOrigin, 
  credentials: true 
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Synapse Chat API is running with Real-Time Socket Support...');
});

app.use('/api/user', userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const PORT = process.env.PORT || 5000;

// 1. Capture the running server instance into a variable
const server = app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

// 2. Initialize Socket.io on top of your server instance with CORS clearance
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"]
  },
});

// 3. Configure the real-time event pipeline listeners
io.on("connection", (socket) => {
  console.log("🔌 New browser tab connected to socket engine");

  // A. Enforce unique room alignment for the user node
  socket.on("setup", (userData) => {
    if (!userData || !userData._id) return;
    socket.leave(userData._id); // Evict lingering threads
    socket.join(userData._id);
    socket.userId = userData._id; 
    console.log(`👤 Isolated Pipeline Established for: ${userData.name}`);
    socket.emit("connected");
  });

  // B. Enforce conversation scope containment
  socket.on("join chat", (room) => {
    if (!room) return;
    socket.join(room);
  });

  // C. Implement explicit recipient packet routing loops
  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat || !chat.users) return;

    const senderId = newMessageReceived.sender._id.toString();

    chat.users.forEach((user) => {
      const recipientId = user._id ? user._id.toString() : user.toString();
      if (recipientId === senderId) return; // Skip sender echo

      // Emits strictly to the private room channel matching the recipient's id
      socket.in(recipientId).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    if (socket.userId) socket.leave(socket.userId);
  });
});