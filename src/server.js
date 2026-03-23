require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const connectDB  = require("./config/db");
const bcrypt     = require("bcrypt");
const User       = require("./models/User"); // ✅ make sure path is correct

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/",        (req, res) => res.status(200).send("VANET CMS Backend Running"));
app.get("/api/test",(req, res) => res.json({ message: "API working" }));

// ── Routes ────────────────────────────────────────────────────────────────────
// Public
app.use("/api/auth",      require("./routes/auth_routes"));

// RSU hardware (x-api-key) + dashboard (JWT)
app.use("/api/accidents", require("./routes/accident_routes"));
app.use("/api/rsu",       require("./routes/rsu_routes"));

// Dashboard only (JWT)
app.use("/api/alerts",    require("./routes/alerts_routes"));
app.use("/api/admin",     require("./routes/admin_routes"));

app.use("/api/notifications", require("./routes/notifications_routes"));

// ── Default Admin Creator ─────────────────────────────────────────────────────
const createDefaultAdmin = async () => {
  try {
    const existing = await User.findOne({ username: "admin" });

    if (!existing) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await User.create({
        username: "admin",
        password: hashedPassword,
        role: "admin"
      });

      console.log("✅ Default admin created (admin / admin123)");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
  }
};

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[CMS] Unhandled error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// ✅ CONNECT DB → CREATE ADMIN → START SERVER
const startServer = async () => {
  try {
    await connectDB();              // connect first
    await createDefaultAdmin();     // then create admin

    app.listen(PORT, () => {
      console.log(`[CMS] Server running on port ${PORT}`);
      console.log(`[CMS] RSU endpoint: POST /api/accidents  (x-api-key)`);
      console.log(`[CMS] RSU heartbeat: POST /api/rsu/heartbeat  (x-api-key)`);
      console.log(`[CMS] Dashboard: GET /api/accidents  (JWT)`);
    });

  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }

  const http = require("http");
const WebSocket = require("ws");

const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store clients
let clients = [];

wss.on("connection", (ws) => {
  console.log("🔌 Client connected");

  clients.push(ws);

  ws.on("close", () => {
    console.log("❌ Client disconnected");
    clients = clients.filter(c => c !== ws);
  });
});

// Make broadcast function globally available
global.broadcast = (data) => {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};
  
startServer();
