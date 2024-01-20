const {
  startCommand,
  walletCommand,
  refreshCommand,
  closeCommand,
  depositCommand,
  exportKeyCommand,
  exportKeyConfirmCommand,
  walletResetCommand,
  walletResetConfirmedCommand,
  withdrawEthCommand,
  withdrawCompletedCommand,
  withdrawToCompleteCommand,
} = require("./commands");

const commandHandlers = {
  "/menu": startCommand,
  "/start": startCommand,
  "/home": startCommand,
  "/wallet": walletCommand,
};

const callbackHandlers = {
  refreshButton: refreshCommand.bind(null, 0),
  refreshWalletButton: refreshCommand.bind(null, 1),
  walletButton: walletCommand,
  closeButton: closeCommand,
  depositButton: depositCommand,
  exportKeyButton: exportKeyCommand,
  exportKeyConfirmButton: exportKeyConfirmCommand,
  walletResetButton: walletResetCommand.bind(null, 0),
  resetKeyToConfirmButton: walletResetCommand.bind(null, 1),
  resetKeyConfirmedButton: walletResetConfirmedCommand,
  withdrawAllButton: withdrawEthCommand.bind(null, true),
  withdrawXButton: withdrawEthCommand.bind(null, false),
};

const replyHandlers = {
  "Reply with the destination address.": withdrawCompletedCommand,
  "Invalid address": withdrawCompletedCommand,
  "You are withdrawing": withdrawCompletedCommand,
  "Reply with the amount to withdraw.": withdrawToCompleteCommand,
  "Invalid amount": withdrawToCompleteCommand,
};

async function handleCommands(msg, chatId) {
  try {
    const handler = commandHandlers[msg];
    if (handler) {
      await handler(chatId);
    }
  } catch (error) {
    console.error("Error handling commands:", error.message);
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
    const handler = callbackHandlers[query];
    if (handler) {
      await handler(chatId, messageId, oldMessage, callbackQueryId);
    }
  } catch (error) {
    console.error("Error handling callbacks:", error.message);
  }
}

async function handleReplies(botText, userText, chatId) {
  try {
    const handler = replyHandlers[botText];
    if (handler) {
      await handler(chatId, userText, botText);
    }
  } catch (error) {
    console.error("Error handling replies:", error.message);
  }
}

module.exports = { handleCommands, handleCallbacks, handleReplies };
