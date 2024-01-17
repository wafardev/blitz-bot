const {
  queryPool,
  generateAndInsertWallet,
  decryptPrivateKey,
  updateWallet,
} = require("./databaseHandler");
const {
  sendMessage,
  sendMessageWithButtons,
  editMessage,
  deleteMessage,
  answerCallbackQuery,
} = require("./telegramHandler");
const {
  generateWelcomeMessage,
  startButtons,
  generateWalletButtons,
  generateWalletMessage,
  depositText,
  addressText,
  exportKeyText,
  cancelOrConfirmButtons,
  exportKeyConfirmText,
  resetWalletText,
  walletResetConfirmedText,
  stripHtmlTags,
} = require("../utils/messageGenerator");
const { getBalance } = require("../utils/rpcCalls");

async function startCommand(chatId) {
  try {
    const startTime = Date.now();

    let data = await queryPool(chatId);

    if (!data) {
      data = await generateAndInsertWallet(chatId);
    }

    console.log(`Address: ${data.address}`);
    const balance = await getBalance(data.address);
    console.log("Balance:", balance);

    const message = generateWelcomeMessage(balance, data.address);

    await sendMessageWithButtons(chatId, message, startButtons);

    const endTime = Date.now();
    console.log("Time taken:", endTime - startTime);
  } catch (error) {
    console.error("Error in startCommand:", error.message);
  }
}

async function refreshCommand(
  chatId,
  messageId,
  oldMessage,
  callbackQueryId,
  refreshNum
) {
  try {
    const startTime = Date.now();

    let newMessage;
    let displayButtons;

    let data = await queryPool(chatId);

    if (!data) {
      console.log("Error: cannot refresh wallet.");
    }

    console.log(`Address: ${data.address}`);
    const balance = await getBalance(data.address);
    console.log("Balance:", balance);

    switch (refreshNum) {
      case 0:
        newMessage = generateWelcomeMessage(balance, data.address);
        displayButtons = startButtons;
        break;
      case 1:
        newMessage = generateWalletMessage(balance, data.address);
        displayButtons = generateWalletButtons(data.address);
        break;
    }

    const messageChanged =
      stripHtmlTags(oldMessage) !== stripHtmlTags(newMessage);
    if (messageChanged) {
      await editMessage(chatId, messageId, newMessage, displayButtons);
    } else {
      console.log("No change in message content.");
    }
    const endTime = Date.now();
    console.log("Time taken:", endTime - startTime);
    // Provide feedback to the user with answerCallbackQuery
    await answerCallbackQuery(callbackQueryId, false);
  } catch (error) {
    console.error("Error in refreshCommand:", error.message);
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
    const balance = await getBalance(data.address);
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

async function walletCommand(chatId, callbackQueryId) {
  try {
    const startTime = Date.now();
    let data = await queryPool(chatId);

    if (!data) {
      console.log("Error: cannot refresh wallet.");
    }

    console.log(`Address: ${data.address}`);
    const balance = await getBalance(data.address);
    console.log("Balance:", balance);

    const walletMessage = generateWalletMessage(balance, data.address);
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

async function closeCommand(chatId, messageId) {
  try {
    // Delete the last message
    await deleteMessage(chatId, messageId);

    console.log(`Last message in chat ${chatId} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting last message:", error.message);
  }
}

module.exports = {
  startCommand,
  refreshCommand,
  depositCommand,
  walletCommand,
  walletResetCommand,
  walletResetConfirmedCommand,
  exportKeyCommand,
  exportKeyConfirmCommand,
  closeCommand,
};
