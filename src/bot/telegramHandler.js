const axios = require("axios");
require("dotenv").config();

const TOKEN = process.env.TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function sendMessageWithButtons(chatId, message, buttons) {
  const messageData = await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
    reply_markup: JSON.stringify(buttons),
  });
  return messageData;
}

async function sendMessage(chatId, message) {
  const messageData = await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
  });
  return messageData;
}

async function sendMessageWithForcedReply(chatId, message) {
  const messageData = await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
    reply_markup: JSON.stringify({ force_reply: true }),
  });
  return messageData;
}

async function editMessage(chatId, messageId, newText) {
  const messageData = await axios.post(`${TELEGRAM_API}/editMessageText`, {
    chat_id: chatId,
    message_id: messageId,
    text: newText,
    parse_mode: "HTML",
  });
  return messageData;
}

async function editMessageWithButtons(chatId, messageId, newText, newButtons) {
  const messageData = await axios.post(`${TELEGRAM_API}/editMessageText`, {
    chat_id: chatId,
    message_id: messageId,
    text: newText,
    parse_mode: "HTML",
    reply_markup: JSON.stringify(newButtons),
  });
  return messageData;
}

async function deleteMessage(chatId, messageId) {
  await axios.post(`${TELEGRAM_API}/deleteMessage`, {
    chat_id: chatId,
    message_id: messageId,
  });
}

async function pinMessage(chatId, messageId) {
  await axios.post(`${TELEGRAM_API}/pinChatMessage`, {
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
  sendMessageWithForcedReply,
  editMessage,
  editMessageWithButtons,
  deleteMessage,
  answerCallbackQuery,
  pinMessage,
};
