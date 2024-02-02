const {
  settingButtons,
  settingsText,
  changeSettingText,
  modifiedSettingText,
} = require("../utils/messageGenerator");

const {
  sendMessageWithButtons,
  sendMessage,
  answerCallbackQuery,
} = require("../bot/telegramHandler");

const { querySettings, updateSettings } = require("../db/databaseHandler");
const { sendMessageWithForcedReply } = require("../bot/telegramHandler");

async function settingCommand(chatId, callbackQueryId) {
  try {
    const settings_data = await querySettings(chatId);

    const {
      leftbuy,
      rightbuy,
      leftsell,
      rightsell,
      buyslippage,
      sellslippage,
      priceimpact,
    } = settings_data;

    const buttons = settingButtons(
      leftbuy,
      rightbuy,
      leftsell,
      rightsell,
      buyslippage,
      sellslippage,
      priceimpact
    );

    await sendMessageWithButtons(chatId, settingsText, buttons);

    if (callbackQueryId) {
      await answerCallbackQuery(callbackQueryId, false);
    }
  } catch (error) {
    console.error("Error in settingCommand:", error.message);
  }
}

async function customizeSettingsCommand(chatId, callbackQueryId, settingNum) {
  try {
    const message = changeSettingText(settingNum);
    await sendMessageWithForcedReply(chatId, message);
    await answerCallbackQuery(callbackQueryId, false);
  } catch (error) {
    console.error("Error in customizeSettingsCommand:", error.message);
  }
}

async function changedSettingCommand(chatId, botText, userText, settingNum) {
  try {
    let changedSetting;
    let goodNumber = false;

    switch (settingNum) {
      case 0:
      case 1:
        if (!(isNaN(userText) || userText <= 0)) {
          changedSetting = settingNum ? "rightbuy" : "leftbuy";
          goodNumber = true;
        }
        break;
      case 2:
      case 3:
        if (!(isNaN(userText) || userText < 1 || userText > 100)) {
          changedSetting = settingNum - 2 ? "rightsell" : "leftsell";
          goodNumber = true;
        }
        break;
      case 4:
      case 5:
        if (!(isNaN(userText) || userText < 0 || userText > 50)) {
          changedSetting = settingNum - 4 ? "sellslippage" : "buyslippage";
          goodNumber = true;
        }
        break;
      case 6:
        if (!(isNaN(userText) || userText < 1 || userText > 100)) {
          changedSetting = "priceimpact";
          goodNumber = true;
        }
        break;
    }

    if (goodNumber) {
      await updateSettings(chatId, changedSetting, userText);
      const text = modifiedSettingText(settingNum, userText);
      await sendMessage(chatId, text);

      const settings_data = await querySettings(chatId);

      const {
        leftbuy,
        rightbuy,
        leftsell,
        rightsell,
        buyslippage,
        sellslippage,
        priceimpact,
      } = settings_data;

      const buttons = settingButtons(
        leftbuy,
        rightbuy,
        leftsell,
        rightsell,
        buyslippage,
        sellslippage,
        priceimpact
      );

      await sendMessageWithButtons(chatId, settingsText, buttons);
    } else {
      const message = `Invalid number entered.\n${botText}`;
      console.log(message);
      await sendMessageWithForcedReply(chatId, message);
    }
  } catch (error) {
    console.error("Error in changedSettingCommands:", error.message);
  }
}

module.exports = {
  settingCommand,
  customizeSettingsCommand,
  changedSettingCommand,
};
