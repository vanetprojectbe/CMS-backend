const axios = require("axios");

async function sendTelegramAlert(accident) {

  try {

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const mapLink = `https://maps.google.com/?q=${accident.latitude},${accident.longitude}`;

    const message = `
🚨 Accident Alert

Vehicle ID: ${accident.vehicleId}

Severity: ${accident.severity}

Location:
Lat: ${accident.latitude}
Lon: ${accident.longitude}

Open Map:
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

    console.error("Telegram alert error:", error.message);

  }

}

module.exports = sendTelegramAlert;
