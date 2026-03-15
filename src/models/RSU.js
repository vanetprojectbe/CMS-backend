const mongoose = require("mongoose");

const RSUSchema = new mongoose.Schema({
  rsuId: { type: String, required: true },
  location: String,
  status: { type: String, default: "online" },
  lastHeartbeat: Date
});

module.exports = mongoose.model("RSU", RSUSchema);