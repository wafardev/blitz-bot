const { tokenNotFoundText } = require("../utils/messageGenerator");
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
  pinCommand,
  referCommand,
  buyCommand,
  checkAddressCommand,
  tokenNotFoundCommand,
} = require("./commands");

async function handleCommands(msg, chatId) {
  try {
    const standardCommands = ["/menu", "/start", "/home", "/wallet"];

    if (standardCommands.includes(msg)) {
      await handleStandardCommand(msg, chatId);
    } else if (msg.startsWith("0x") && msg.length == 42) {
      await checkAddressCommand(chatId, msg);
    } else {
      await tokenNotFoundCommand(chatId, msg);
    }
  } catch (error) {
    console.error("Error handling commands:", error.message);
  }
}

async function handleStandardCommand(command, chatId) {
  try {
    switch (command) {
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
    console.error(`Error handling ${command} command:`, error.message);
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
      case "resetKeyConfirmedButton":
        await walletResetConfirmedCommand(chatId, callbackQueryId);
        break;
      case "withdrawAllButton":
        await withdrawEthCommand(chatId, callbackQueryId, true);
        break;
      case "withdrawXButton":
        await withdrawEthCommand(chatId, callbackQueryId, false);
        break;
      case "pinButton":
        await pinCommand(chatId, messageId, callbackQueryId);
        break;
      case "referButton":
        await referCommand(chatId, callbackQueryId);
        break;
      case "buyButton":
        await buyCommand(chatId, callbackQueryId);
        break;
    }
  } catch (error) {
    console.error("Error handling commands:", error.message);
  }
}

async function handleReplies(botText, userText, chatId) {
  try {
    let text;
    console.log(botText);
    const withdrawText = "Reply with the amount to withdraw.";
    const invalidText = "Invalid address";
    const invalidAmountText = "Invalid amount";
    const validWithdrawText = "You are withdrawing";
    if (botText.startsWith(withdrawText)) text = withdrawText;
    else if (botText.startsWith(invalidText)) text = invalidText;
    else if (botText.startsWith(validWithdrawText)) text = validWithdrawText;
    else if (botText.startsWith(invalidAmountText)) text = invalidAmountText;
    else text = botText;
    switch (text) {
      case "Reply with the destination address.":
      case "Invalid address":
        await withdrawCompletedCommand(chatId, userText);
        break;
      case "You are withdrawing":
        await withdrawCompletedCommand(chatId, userText, botText);
        break;
      case "Reply with the amount to withdraw.":
      case "Invalid amount":
        await withdrawToCompleteCommand(chatId, userText);
        break;
    }
  } catch (error) {
    console.error("Error handling replies:", error.message);
  }
}

module.exports = { handleCommands, handleCallbacks, handleReplies };
