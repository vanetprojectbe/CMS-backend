const mongoose = require("mongoose");

const EmergencyServiceSchema = new mongoose.Schema({
  name: String,
  type: String, // hospital | police | fire

  phone: String,

  telegramChatId: String, // IMPORTANT

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: [Number] // [longitude, latitude]
  }
});

/* Enable geospatial queries */
EmergencyServiceSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("EmergencyService", EmergencyServiceSchema);
