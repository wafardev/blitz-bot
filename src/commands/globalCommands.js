const {
  generateWelcomeMessage,
  startButtons,
  generateWalletButtons,
  generateWalletMessage,
  buyText,
  closeButton,
  tokenNotFoundText,
  tokenDetailsText,
  tokenDetailsButtons,
} = require("../utils/messageGenerator");

const {
  stripHtmlTags,
  extractAddressFromString,
  formatNumber,
  calculatePriceImpact,
  calculateMarketCap,
} = require("../utils/misc");
const {
  deleteMessage,
  answerCallbackQuery,
  pinMessage,
  sendMessageWithButtons,
  sendMessage,
  editMessageWithButtons,
} = require("../bot/telegramHandler");

const {
  queryPool,
  generateAndInsertWallet,
  querySettings,
} = require("../db/databaseHandler");

const {
  getAmountInUSD,
  getTokenInfo,
  getTokenPriceTestnet,
} = require("../utils/apiCalls");

const { getBalance, getPairAddress } = require("../utils/rpcCalls");

async function startCommand(chatId) {
  try {
    const startTime = Date.now();

    let data = await queryPool(chatId);

    if (!data) {
      data = await generateAndInsertWallet(chatId, true);
    }

    console.log(`Address: ${data.address}`);
    const balance = await getBalance(data.address, false);
    const fixedBalance = parseFloat(balance).toFixed(4);
    console.log("Balance:", balance);

    const balanceInUSD = await getAmountInUSD(balance);

    const message = generateWelcomeMessage(
      fixedBalance,
      data.address,
      balanceInUSD
    );

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
    const balance = await getBalance(data.address, false);
    console.log("Balance:", balance);

    const balanceInUSD = await getAmountInUSD(balance);

    switch (refreshNum) {
      case 0:
        newMessage = generateWelcomeMessage(
          balance,
          data.address,
          balanceInUSD
        );
        displayButtons = startButtons;
        break;
      case 1:
        newMessage = generateWalletMessage(balance, data.address, balanceInUSD);
        displayButtons = generateWalletButtons(data.address);
        break;
    }

    const messageChanged =
      stripHtmlTags(oldMessage) !== stripHtmlTags(newMessage);
    if (messageChanged) {
      await editMessageWithButtons(
        chatId,
        messageId,
        newMessage,
        displayButtons
      );
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

async function referCommand(chatId, callbackQueryId) {
  try {
    await sendMessage(chatId, "Coming soon!");
    await answerCallbackQuery(callbackQueryId, false);
  } catch (error) {
    console.error("Error in referCommand:", error.message);
    // Handle the error appropriately (e.g., send an error message to the user)
  }
}

async function pinCommand(chatId, messageId, callbackQueryId) {
  try {
    await pinMessage(chatId, messageId);
    console.log(`Last message in chat ${chatId} pinned successfully.`);

    await answerCallbackQuery(callbackQueryId, false);
  } catch (error) {
    console.error("Error pinning last message:", error.message);
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

async function emptyCommand(callbackQueryId) {
  try {
    await answerCallbackQuery(callbackQueryId, false);
  } catch (error) {
    console.error("Error in emptyCommand:", error.message);
  }
}

async function buyCommand(chatId, callbackQueryId) {
  try {
    await sendMessageWithButtons(chatId, buyText, closeButton);
    await answerCallbackQuery(callbackQueryId, false);
  } catch (error) {
    console.error("Error in buyCommand:", error.message);
  }
}

async function tokenNotFoundCommand(chatId, msg) {
  const message = tokenNotFoundText(msg);
  await sendMessage(chatId, message);
}

async function checkAddressCommand(
  chatId,
  userText,
  refreshedBool,
  oldMessage,
  inlineKeyboard,
  messageId,
  callbackQueryId
) {
  const startTime = Date.now();

  if (refreshedBool) userText = extractAddressFromString(userText);
  const pairAddress = await getPairAddress("weth", userText);

  let pairData = await getTokenInfo(pairAddress, true);
  const data = await queryPool(chatId);
  const balance = await getBalance(data.address, false);
  if (pairData) {
    if (pairData[0].tokenInfo.symbol == "WETH") {
      pairData = pairData[1];
    } else pairData = pairData[0];
    console.log(pairData);
    const priceUsd = await getTokenPriceTestnet(pairAddress);
    const {
      tokenInfo: { symbol, name, decimals, totalSupply },
    } = pairData;
    console.log(priceUsd);
    const tokenPrice = formatNumber(priceUsd[0]);
    console.log(tokenPrice);

    const formattedMarketCap = calculateMarketCap(
      priceUsd[0],
      totalSupply,
      decimals
    );

    const data = await querySettings(chatId);
    const { leftbuy, rightbuy } = data;
    const priceImpact = calculatePriceImpact(
      rightbuy * 10 ** decimals,
      priceUsd[2],
      priceUsd[1],
      false
    );
    console.log(priceImpact);
    const message = tokenDetailsText(
      symbol,
      name,
      userText,
      tokenPrice,
      formattedMarketCap,
      rightbuy,
      priceImpact,
      parseFloat(balance).toFixed(4)
    );
    const tokenDetailsKeyboard = tokenDetailsButtons(
      userText,
      pairAddress,
      leftbuy,
      rightbuy
    );
    console.log(userText);

    if (refreshedBool && callbackQueryId) {
      if (
        stripHtmlTags(oldMessage) !== stripHtmlTags(message) ||
        JSON.stringify(tokenDetailsKeyboard) !== JSON.stringify(inlineKeyboard)
      ) {
        await editMessageWithButtons(
          chatId,
          messageId,
          message,
          tokenDetailsKeyboard
        );
        await answerCallbackQuery(callbackQueryId, false);
      } else {
        await answerCallbackQuery(callbackQueryId, false);
      }
    } else {
      await sendMessageWithButtons(chatId, message, tokenDetailsKeyboard);
    }
  } else {
    await tokenNotFoundCommand(chatId, userText);
  }
  const endTime = Date.now();
  console.log("Time taken:", endTime - startTime);
}

module.exports = {
  startCommand,
  refreshCommand,
  emptyCommand,
  pinCommand,
  closeCommand,
  referCommand,
  buyCommand,
  tokenNotFoundCommand,
  checkAddressCommand,
};
