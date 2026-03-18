const axios = require("axios");
const generateMapLink = require("./mapLink");

async function sendAlert(service, accident) {

  try {

    const token = process.env.TELEGRAM_BOT_TOKEN;

    const mapLink = generateMapLink(
      accident.latitude,
      accident.longitude
    );

    const message = `
🚨 EMERGENCY ALERT 🚨

Service: ${service.name}

Vehicle: ${accident.vehicleId}

Severity: ${accident.severity}

📍 Location:
${mapLink}

⏱ Time:
${new Date().toLocaleString()}
`;

    await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: service.telegramChatId,
        text: message
      }
    );

    console.log(`✅ Sent to ${service.name}`);

  } catch (err) {
    console.error("Telegram error:", err.message);
  }

}

module.exports = sendAlert;
