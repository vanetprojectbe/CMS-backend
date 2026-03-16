const axios = require("axios");
const generateMapLink = require("./mapLink");

async function sendTelegramAlert(accident) {

  try {

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const mapLink = generateMapLink(
      accident.latitude,
      accident.longitude
    );

    const message = `
🚨 Accident Alert

Vehicle ID: ${accident.vehicleId}

Severity: ${accident.severity}

Location Coordinates
Latitude: ${accident.latitude}
Longitude: ${accident.longitude}

Open in Google Maps
${mapLink}
`;

    await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: chatId,
        text: message
      }
    );

    console.log("Telegram alert sent");

  } catch (error) {

    console.error("Telegram alert failed:", error.message);

  }

}

module.exports = sendTelegramAlert;
