const {
  startCommand,
  walletCommand,
  refreshCommand,
  closeCommand,
  depositCommand,
  exportKeyCommand,
  exportKeyConfirmCommand,
  walletResetCommand,
} = require("./commands");

async function handleCommands(msg, chatId) {
  try {
    switch (msg) {
      case "/menu":
      case "/start":
      case "/home":
        await startCommand(chatId);
        break;
      case "/wallet":
        await walletCommand(chatId);
        break;
    }
  } catch (error) {
    console.error("Error handling commands:", error.message);
    // Handle the error appropriately (e.g., send an error message to the user)
  }
}

async function handleCallbacks(
  query,
  chatId,
  messageId,
  oldMessage,
  callbackQueryId
) {
  try {
    switch (query) {
      case "refreshButton":
        await refreshCommand(chatId, messageId, oldMessage, callbackQueryId, 0);
        break;
      case "refreshWalletButton":
        await refreshCommand(chatId, messageId, oldMessage, callbackQueryId, 1);
        break;
      case "walletButton":
        await walletCommand(chatId, callbackQueryId);
        break;
      case "closeButton":
        await closeCommand(chatId, messageId);
        break;
      case "depositButton":
        await depositCommand(chatId, callbackQueryId);
        break;
      case "exportKeyButton":
        await exportKeyCommand(chatId, callbackQueryId);
        break;
      case "exportKeyConfirmButton":
        await exportKeyConfirmCommand(chatId, callbackQueryId);
        break;
      case "walletResetButton":
        await walletResetCommand(chatId, callbackQueryId, 0);
        break;
      case "resetKeyToConfirmButton":
        await walletResetCommand(chatId, callbackQueryId, 1);
        break;
    }
  } catch (error) {
    console.error("Error handling commands:", error.message);
  }
}

module.exports = { handleCommands, handleCallbacks };
