const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const axios = require("axios");
const { handleCommands, handleCallbacks } = require("../bot/commandHandler");

const { TOKEN, SERVER_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = `${SERVER_URL}${URI}`;

const app = express();
app.use(bodyParser.json());

const init = async () => {
  try {
    const res = await axios.get(
      `${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`
    );
    console.log("Webhook initialized:", res.data);
  } catch (error) {
    console.error("Error initializing webhook:", error.message);
  }
};

app.post(URI, async (req, res) => {
  try {
    if (req.body.callback_query) {
      const {
        data,
        callback_query: {
          from: { id: chatId },
          message: { message_id: messageId, text: oldMessage },
          id: callbackQueryId,
        },
      } = req.body;

      console.log(
        `Received callback query data: ${data} from chat ID: ${chatId}`
      );

      handleCallbacks(data, chatId, messageId, oldMessage, callbackQueryId);
    } else if (req.body.message) {
      const {
        message: {
          chat: { id: chatId },
          text,
        },
      } = req.body;

      console.log(`Received message: ${text} from chat ID: ${chatId}`);

      handleCommands(text, chatId);
    } else {
      console.log("Received unknown message format.");
      return res.status(400).send("Bad Request: Unknown message format.");
    }
    res.status(200).send("Message received and processed.");
  } catch (error) {
    console.error("Error processing incoming message:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(process.env.SERVER_PORT, async () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT}.`);
  await init();
});
