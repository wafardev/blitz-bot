const axios = require("axios");
require("dotenv").config();

const TOKEN = process.env.TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function sendMessageWithButtons(chatId, message, buttons) {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
    reply_markup: JSON.stringify(buttons),
  });
}

async function sendMessage(chatId, message) {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
  });
}

async function editMessage(chatId, messageId, newText, newButtons) {
  await axios.post(`${TELEGRAM_API}/editMessageText`, {
    chat_id: chatId,
    message_id: messageId,
    text: newText,
    parse_mode: "HTML",
    reply_markup: JSON.stringify(newButtons),
  });
}

async function deleteMessage(chatId, messageId) {
  await axios.post(`${TELEGRAM_API}/deleteMessage`, {
    chat_id: chatId,
    message_id: messageId,
  });
}

async function answerCallbackQuery(callbackQueryId, showAlert) {
  await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
    callback_query_id: callbackQueryId,
    show_alert: showAlert,
  });
}

module.exports = {
  sendMessageWithButtons,
  sendMessage,
  editMessage,
  deleteMessage,
  answerCallbackQuery,
};
