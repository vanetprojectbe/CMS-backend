require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const connectDB  = require("./config/db");

const app = express();

// ── Database ──────────────────────────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/",        (req, res) => res.status(200).send("VANET CMS Backend Running"));
app.get("/api/test",(req, res) => res.json({ message: "API working" }));

// ── Routes ────────────────────────────────────────────────────────────────────
// Public
app.use("/api/auth",      require("./routes/auth_routes"));

// RSU hardware (x-api-key) + dashboard (JWT) — auth enforced per route
app.use("/api/accidents", require("./routes/accident_routes"));
app.use("/api/rsu",       require("./routes/rsu_routes"));

// Dashboard only (JWT)
app.use("/api/alerts",    require("./routes/alerts_routes"));
app.use("/api/admin",     require("./routes/admin_routes"));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[CMS] Unhandled error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[CMS] Server running on port ${PORT}`);
  console.log(`[CMS] RSU endpoint: POST /api/accidents  (x-api-key)`);
  console.log(`[CMS] RSU heartbeat: POST /api/rsu/heartbeat  (x-api-key)`);
  console.log(`[CMS] Dashboard: GET /api/accidents  (JWT)`);
});

// In server.js — add this line alongside the existing /api/accidents mount
app.use("/api/incidents", require("./routes/accident_routes"));  // alias for frontend
app.use("/api/accidents", require("./routes/accident_routes"));  // keep for RSU hardware
