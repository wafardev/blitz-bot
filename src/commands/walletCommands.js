const {
  queryPool,
  updateWallet,
  decryptPrivateKey,
} = require("../db/databaseHandler");

const { getBalance, withdrawEth } = require("../utils/rpcCalls");

const { getAmountInUSD } = require("../utils/apiCalls");

const {
  generateWalletButtons,
  generateWalletMessage,
  resetWalletText,
  walletResetConfirmedText,
  exportKeyConfirmText,
  invalidText,
  depositText,
  addressText,
  withdrawSuccessOrFailText,
  cancelOrConfirmButtons,
  exportKeyText,
} = require("../utils/messageGenerator");

const { findNumbersInDocstring } = require("../utils/misc");

const {
  sendMessage,
  sendMessageWithButtons,
  sendMessageWithForcedReply,
  answerCallbackQuery,
  editMessage,
} = require("../bot/telegramHandler");

async function walletCommand(chatId, callbackQueryId) {
  try {
    const startTime = Date.now();
    let data = await queryPool(chatId);

    if (!data) {
      console.log("Error: cannot refresh wallet.");
    }

    console.log(`Address: ${data.address}`);
    const balance = await getBalance(data.address, false);
    console.log("Balance:", balance);
    const fixedBalance = parseFloat(balance).toFixed(6);

    const balanceInUSD = await getAmountInUSD(balance);
    console.log("Balance in USD:", balanceInUSD);
    const walletMessage = generateWalletMessage(
      fixedBalance,
      data.address,
      balanceInUSD
    );
    console.log(walletMessage);
    const walletButtons = generateWalletButtons(data.address);

    await sendMessageWithButtons(chatId, walletMessage, walletButtons);

    if (callbackQueryId) {
      await answerCallbackQuery(callbackQueryId, false);
    }

    const endTime = Date.now();
    console.log("Time taken:", endTime - startTime);
  } catch (error) {
    console.error("Error in walletCommand:", error.message);
    // Handle the error appropriately (e.g., send an error message to the user)
  }
}

async function walletResetCommand(chatId, callbackQueryId, textNum) {
  try {
    const startTime = Date.now();
    const message = resetWalletText(textNum);
    await sendMessageWithButtons(
      chatId,
      message,
      cancelOrConfirmButtons(textNum + 1)
    );
    console.log("Reset text sent.");

    await answerCallbackQuery(callbackQueryId, false);

    const endTime = Date.now();
    console.log("Time taken:", endTime - startTime);
  } catch (error) {
    console.error("Error in walletResetCommand:", error.message);
    // Handle the error appropriately (e.g., send an error message to the user)
  }
}

async function walletResetConfirmedCommand(chatId, callbackQueryId) {
  try {
    const startTime = Date.now();

    let data = await queryPool(chatId);
    const key = decryptPrivateKey(chatId, data.encrypted_key);
    const firstMessage = walletResetConfirmedText(key, 0);
    await sendMessage(chatId, firstMessage);

    await updateWallet(chatId);

    data = await queryPool(chatId);
    const secondMessage = walletResetConfirmedText(data.address, 1);
    await sendMessage(chatId, secondMessage);

    await answerCallbackQuery(callbackQueryId, false);

    const endTime = Date.now();
    console.log("Time taken:", endTime - startTime);
  } catch (error) {
    console.error("Error in walletResetCommand:", error.message);
    // Handle the error appropriately (e.g., send an error message to the user)
  }
}

async function exportKeyCommand(chatId, callbackQueryId) {
  try {
    const startTime = Date.now();

    await sendMessageWithButtons(
      chatId,
      exportKeyText,
      cancelOrConfirmButtons(0)
    );
    console.log("Text sent.");

    await answerCallbackQuery(callbackQueryId, false);

    const endTime = Date.now();
    console.log("Time taken:", endTime - startTime);
  } catch (error) {
    console.error("Error in exportKeyCommand:", error.message);
    // Handle the error appropriately (e.g., send an error message to the user)
  }
}

async function exportKeyConfirmCommand(chatId, callbackQueryId) {
  try {
    const startTime = Date.now();

    let data = await queryPool(chatId);

    if (!data) {
      console.log("Error: cannot refresh wallet.");
    }

    console.log(`Address: ${data.address}`);
    console.log(`Encrypted key: ${data.encrypted_key}`);

    const privateKey = decryptPrivateKey(chatId, data.encrypted_key);

    const privateMessage = exportKeyConfirmText(privateKey);

    await sendMessage(chatId, privateMessage);
    await answerCallbackQuery(callbackQueryId, false);
    const endTime = Date.now();
    console.log("Time taken:", endTime - startTime);
  } catch (error) {
    console.error("Error in exportKeyConfirmCommand:", error.message);
    // Handle the error appropriately (e.g., send an error message to the user)
  }
}

async function withdrawEthCommand(chatId, callbackQueryId, withdrawAll) {
  try {
    const startTime = Date.now();

    if (withdrawAll) {
      const message = "Reply with the destination address.";
      await sendMessageWithForcedReply(chatId, message);
    } else {
      const data = await queryPool(chatId);
      const balance = await getBalance(data.address, true);
      const message = `Reply with the amount you wish to withdraw. (0 - ${parseFloat(
        balance
      ).toFixed(6)}) ETH, Example: 0.1`;
      await sendMessageWithForcedReply(chatId, message);
    }
    await answerCallbackQuery(callbackQueryId, false);
    const endTime = Date.now();
    console.log("Time taken:", endTime - startTime);
    console.log("Withdraw text sent.");
  } catch (error) {
    console.error("Error in withdrawEthCommand:", error.message);
  }
}

async function withdrawCompletedCommand(chatId, userText, amountInText) {
  try {
    const startTime = Date.now();

    if (userText.startsWith("0x") && userText.length === 42) {
      const messageData = await sendMessage(
        chatId,
        "Initializing transaction..."
      );
      const messageId = messageData.data.result.message_id;
      console.log(messageData.data.result.message_id);

      const depositAddress = userText;
      const data = await queryPool(chatId);
      const privateKey = decryptPrivateKey(chatId, data.encrypted_key);
      let tx;
      if (amountInText) {
        const amount = findNumbersInDocstring(amountInText);
        tx = withdrawEth(privateKey, depositAddress, "sepolia", amount);
      } else {
        tx = withdrawEth(privateKey, depositAddress, "sepolia");
      }
      tx.then(async (txHash) => {
        console.log(txHash);
        await editMessage(
          chatId,
          messageId,
          withdrawSuccessOrFailText(true, txHash)
        );
      }).catch(async (error) => {
        await editMessage(
          chatId,
          messageId,
          withdrawSuccessOrFailText(false, error)
        );
      });
    } else {
      let message = invalidText(true, userText);
      if (amountInText) {
        const amount = findNumbersInDocstring(amountInText);
        const firstSentence = `You are withdrawing ${amount} ETH.`;
        message = `${firstSentence}\n\n${message}`;
      }
      await sendMessageWithForcedReply(chatId, message);
    }
    const endTime = Date.now();
    console.log("Time taken:", endTime - startTime);
    console.log("Withdraw text sent.");
  } catch (error) {
    console.error("Error in withdrawEthCommand:", error.message);
    // Handle the error appropriately (e.g., send an error message to the user)
  }
}

async function withdrawToCompleteCommand(chatId, userText) {
  try {
    let number = "";
    let numberType = "int";

    const data = await queryPool(chatId);
    const balance = await getBalance(data.address, true);
    const invalidMessage = invalidText(false, userText, balance);

    for (let i = 0; i < userText.length; i++) {
      if (userText[i] == "," || userText[i] == ".") {
        number += ".";
        numberType = "float";
      } else if (!isNaN(userText[i])) {
        number += userText[i];
      } else {
        sendMessageWithForcedReply(chatId, invalidMessage);
        return;
      }
    }

    if (numberType == "float") {
      number = parseFloat(number);
    } else {
      number = parseInt(number);
    }

    const validMessage = `You are withdrawing ${number} ETH.
  
Reply with the destination address.`;

    if (number > balance || number == 0) {
      sendMessageWithForcedReply(chatId, invalidMessage);
      return;
    } else sendMessageWithForcedReply(chatId, validMessage);
  } catch (error) {
    console.error("Error in withdrawToCompleteCommand:", error.message);
    // Handle the error appropriately (e.g., send an error message to the user)
  }
}

async function depositCommand(chatId, callbackQueryId) {
  try {
    const startTime = Date.now();
    let data = await queryPool(chatId);

    if (!data) {
      console.log("Error: cannot refresh wallet.");
    }

    console.log(`Address: ${data.address}`);
    const balance = await getBalance(data.address, false);
    console.log("Balance:", balance);

    await sendMessage(chatId, depositText);
    console.log("Deposit text sent.");
    await sendMessage(chatId, addressText(data.address));
    console.log("Address sent.");
    await answerCallbackQuery(callbackQueryId, false);

    const endTime = Date.now();
    console.log("Time taken:", endTime - startTime);
  } catch (error) {
    console.error("Error in depositCommand:", error.message);
    // Handle the error appropriately (e.g., send an error message to the user)
  }
}

module.exports = {
  walletCommand,
  walletResetCommand,
  walletResetConfirmedCommand,
  exportKeyConfirmCommand,
  exportKeyCommand,
  withdrawCompletedCommand,
  depositCommand,
  withdrawToCompleteCommand,
  withdrawEthCommand,
};
