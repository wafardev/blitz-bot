const {
  startCommand,
  walletCommand,
  emptyCommand,
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
  settingCommand,
  customizeSettingsCommand,
  changedSettingCommand,
  buyTokenCommand,
  promptAmountToBuyCommand,
} = require("./commands");

const { changeSettingText } = require("../utils/messageGenerator");

async function handleCommands(msg, chatId) {
  try {
    const standardCommands = [
      "/menu",
      "/start",
      "/home",
      "/wallet",
      "/settings",
    ];

    if (standardCommands.includes(msg)) {
      await handleStandardCommand(msg, chatId);
    } else if (msg.startsWith("0x") && msg.length == 42) {
      await checkAddressCommand(chatId, msg, false);
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
      case "/settings":
        await settingCommand(chatId);
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
  inlineKeyboard,
  callbackQueryId
) {
  try {
    switch (query) {
      // Global buttons
      case "emptyButton":
        await emptyCommand(callbackQueryId);
        break;
      case "closeButton":
        await closeCommand(chatId, messageId);
        break;
      case "refreshButton":
        await refreshCommand(chatId, messageId, oldMessage, callbackQueryId, 0);
        break;
      case "refreshWalletButton":
        await refreshCommand(chatId, messageId, oldMessage, callbackQueryId, 1);
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
      case "settingButton":
        await settingCommand(chatId, callbackQueryId);
        break;
      // Wallet buttons
      case "walletButton":
        await walletCommand(chatId, callbackQueryId);
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
      // Setting buttons
      case "leftBuySettingButton":
        await customizeSettingsCommand(chatId, callbackQueryId, 0);
        break;
      case "rightBuySettingButton":
        await customizeSettingsCommand(chatId, callbackQueryId, 1);
        break;
      case "leftSellSettingButton":
        await customizeSettingsCommand(chatId, callbackQueryId, 2);
        break;
      case "rightSellSettingButton":
        await customizeSettingsCommand(chatId, callbackQueryId, 3);
        break;
      case "buySlippageSettingButton":
        await customizeSettingsCommand(chatId, callbackQueryId, 4);
        break;
      case "sellSlippageSettingButton":
        await customizeSettingsCommand(chatId, callbackQueryId, 5);
        break;
      case "priceImpactSettingButton":
        await customizeSettingsCommand(chatId, callbackQueryId, 6);
        break;
      // Token buttons
      case "firstBuyButton":
        await buyTokenCommand(chatId, callbackQueryId, 0, oldMessage);
        break;
      case "secondBuyButton":
        await buyTokenCommand(chatId, callbackQueryId, 1, oldMessage);
        break;
      case "thirdBuyButton":
        await promptAmountToBuyCommand(chatId, callbackQueryId, oldMessage);
      case "refreshTokenButton":
        await checkAddressCommand(
          chatId,
          oldMessage,
          true,
          oldMessage,
          inlineKeyboard,
          messageId,
          callbackQueryId
        );
        break;
      case "refreshTokenPositionsButton":
        await refreshTokenPositionsCommand(
          chatId,
          messageId,
          oldMessage,
          callbackQueryId,
          2
        );
        break;
      case "firstSellButton":
        await sellTokenCommand(chatId, callbackQueryId, 0, oldMessage);
        break; // TODO
      case "secondSellButton":
        await sellTokenCommand(chatId, callbackQueryId, 1, oldMessage);
        break; // TODO
      case "thirdSellButton":
        await sellTokenCommand(chatId, callbackQueryId, 2, oldMessage);
        break; // TODO
    }
  } catch (error) {
    console.error("Error handling commands:", error.message);
  }
}

async function handleReplies(botText, userText, chatId) {
  try {
    let text;
    console.log(botText);
    let settingTextArray = [];
    for (let i = 0; i < 7; i++) {
      settingTextArray.push(changeSettingText(i));
    }
    let settingNum;

    const withdrawText = "Reply with the amount you wish to withdraw.";
    const invalidText = "Invalid address";
    const invalidAmountText = "Invalid amount";
    const invalidNumberText = "Invalid number";
    const validWithdrawText = "You are withdrawing";
    const validBuyText = "You are buying";
    if (botText.startsWith(withdrawText)) text = withdrawText;
    else if (botText.startsWith(invalidText)) text = invalidText;
    else if (botText.startsWith(validWithdrawText)) text = validWithdrawText;
    else if (botText.startsWith(invalidAmountText)) text = invalidAmountText;
    else if (settingTextArray.includes(botText)) {
      text = `Change settings`;
      settingNum = settingTextArray.indexOf(botText);
    } else if (botText.startsWith(invalidNumberText)) {
      text = `Change settings`;
      botText = botText.split(/\n/)[1];
      settingNum = settingTextArray.indexOf(botText);
    } else if (botText.startsWith(validBuyText)) {
      text = validBuyText;
    } else text = botText;
    switch (text) {
      case "Reply with the destination address.":
      case "Invalid address":
        await withdrawCompletedCommand(chatId, userText);
        break;
      case "You are withdrawing":
        await withdrawCompletedCommand(chatId, userText, botText);
        break;
      case "Reply with the amount you wish to withdraw.":
      case "Invalid amount":
        await withdrawToCompleteCommand(chatId, userText);
        break;
      case "Change settings":
        await changedSettingCommand(chatId, botText, userText, settingNum);
        break;
      case "You are buying":
        console.log("here");
        await buyTokenCommand(chatId, false, 2, botText, userText);
        break;
    }
  } catch (error) {
    console.error("Error handling replies:", error.message);
  }
}

module.exports = { handleCommands, handleCallbacks, handleReplies };
