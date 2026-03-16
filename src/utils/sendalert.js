const axios = require("axios");

async function sendAlert(service, accident) {

  const message = `
Accident detected!

Severity: ${accident.severity}

Location:
https://maps.google.com/?q=${accident.latitude},${accident.longitude}

Vehicle: ${accident.vehicleId}
`;

  console.log("Sending alert to:", service.name);

  // Example SMS API call
  // await axios.post("SMS_API_URL", { phone: service.phone, message });

}

module.exports = sendAlert;
