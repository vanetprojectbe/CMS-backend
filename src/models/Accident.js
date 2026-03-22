const mongoose = require("mongoose");

const AccidentSchema = new mongoose.Schema({

  // ── Source ────────────────────────────────────────────────────────────────
  rsuId:     String,
  vehicleId: String,

  // ── Classification (from ML service) ─────────────────────────────────────
  severity:   String,
  confidence: Number,

  // ── GPS ───────────────────────────────────────────────────────────────────
  latitude:  Number,
  longitude: Number,

  // ── Raw EAM fields from OBU ───────────────────────────────────────────────
  // These are forwarded directly from the OBU JSON payload via RSU
  eam: {
    acc:    Number,   // fused acceleration m/s²
    gyro:   Number,   // angular velocity deg/s
    a6050:  Number,   // MPU6050 reading
    a9250:  Number,   // MPU9250 reading
    cons:   Number,   // IMU consistency score
    idur:   Number,   // impact duration ms
    vib:    Number,   // vibration 0/1
    temp:   Number,   // temperature °C
    abag:   Number,   // airbag deployed 0/1
    wdrop:  Number,   // wheel speed drop %
    spd:    Number,   // vehicle speed km/h
    hh:     Number,
    mm:     Number,
    ss:     Number
  },

  // ── ML features (arbitrary object for future use) ─────────────────────────
  features: Object,

  // ── Workflow status ───────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ["open", "dispatched", "acknowledged", "resolved"],
    default: "open"
  },

  description: String,

  timestamp:  { type: Date, default: Date.now },
  resolvedAt: Date

});

module.exports = mongoose.model("Accident", AccidentSchema);
