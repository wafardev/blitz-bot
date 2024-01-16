const pool = require("../database/db");
const axios = require("axios");
const generateNewWallet = require("./walletGenerator");
const {
  deriveKey,
  encryptPassphrase,
  decryptPassphrase,
} = require("../secret/keyHasher");
const {
  generateWelcomeMessage,
  startButtons,
  generateWalletButtons,
  generateWalletMessage,
} = require("./messageGenerator");
const { getBalance } = require("./rpcCalls");

const TOKEN = process.env.TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function handleCommands(msg, chatId) {
  try {
    switch (msg) {
      case "/menu":
      case "/start":
      case "/home":
        await startCommand(chatId);
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
      case "walletButton":
        await walletCommand(chatId, callbackQueryId);
        break;
      case "closeButton":
        await closeCommand(chatId, messageId);
        break;
    }
  } catch (error) {
    console.error("Error handling commands:", error.message);
    // Handle the error appropriately (e.g., send an error message to the user)
  }
}

async function queryPool(chatId) {
  try {
    const query = "SELECT * FROM wallet_database WHERE t_id = $1";
    const result = await pool.query(query, [chatId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error querying pool:", error.message);
  }
}

async function generateAndInsertWallet(chatId) {
  try {
    const { privateKey, userAddress } = generateNewWallet();

    const encrypted_key = encryptPassphrase(
      deriveKey(chatId.toString()),
      privateKey
    );

    // Insert wallet information into the database
    const insertQuery = `
        INSERT INTO wallet_database (t_id, encrypted_key, address)
        VALUES ($1, $2, $3)
        RETURNING t_id, encrypted_key, address;
      `;

    const result = await pool.query(insertQuery, [
      chatId,
      encrypted_key,
      userAddress,
    ]);

    console.log("Inserted wallet data:", result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error("Error generating and inserting wallet:", error.message);
  }
}

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
    await answerCallbackQuery(callbackQueryId, false);

    const endTime = Date.now();
    console.log("Time taken:", endTime - startTime);
  } catch (error) {
    console.error("Error in refreshCommand:", error.message);
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

async function sendMessageWithButtons(chatId, message, buttons) {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: message,
    parse_mode: "HTML",
    reply_markup: JSON.stringify(buttons),
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

function stripHtmlTags(text) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = { handleCommands, handleCallbacks };
