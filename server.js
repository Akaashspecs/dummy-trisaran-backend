// server.js
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const usersCategories = require("./routes/categories");
const usersProducts = require("./routes/product");
const leadsRoutes = require("./routes/leads");
const kycRoutes = require("./routes/kycRoutes");
const bankAccountRoutes = require("./routes/bankAccounts");
const notificationsRoutes = require("./routes/notificationsRoutes");
const supportTicketRoutes = require("./routes/supportTicket");
const TransactionRoutes = require("./routes/transactions");
const WithdrawlRoutes = require("./routes/withdrawl");
const app = express();

// Create SINGLE server
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:3000",
  "https://trisaran-app.netlify.app",
];

// Attach socket.io to the SAME server
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Export io so socket/notificationSocket can use it
module.exports.io = io;

// --- SOCKET.IO CONNECTION HANDLER ---
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("joinRoom", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`📌 User ${userId} joined their notification room`);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start Firebase listener
const { listenToNotifications } = require("./socket/notificationSocket");
listenToNotifications();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Routes
app.get("/", (req, res) => res.json({ ok: true, service: "trisaran-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/categories", usersCategories);
app.use("/api/products", usersProducts);
app.use("/api/leads", leadsRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api", bankAccountRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/tickets", supportTicketRoutes);
app.use("/api/transactions", TransactionRoutes);
app.use("/api/withdrawl", WithdrawlRoutes);
// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled err:", err);
  res.status(500).json({ error: "Server error" });
});

// Start server ONCE
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});
