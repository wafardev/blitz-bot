const {
  getTokenInfo,
  getTokenPriceTestnet,
  getAmountInUSD,
} = require("../utils/apiCalls");

const {
  formatNumber,
  extractAddressFromString,
  calculateMarketCap,
  weiToEtherFormat,
  extractTokenNameFromString,
} = require("../utils/misc");

const {
  queryPool,
  querySettings,
  decryptPrivateKey,
  addTokenIntoDatabase,
  updateTokenApproval,
} = require("../db/databaseHandler");
const {
  sendMessage,
  sendMessageWithButtons,
  answerCallbackQuery,
  editMessage,
  editMessageWithButtons,
  sendMessageWithForcedReply,
} = require("./telegramHandler");

const {
  settingCommand,
  customizeSettingsCommand,
  changedSettingCommand,
} = require("../commands/settingCommands");

const {
  boughtTokenDetailsButtons,
  boughtTokenText,
  buyCustomAmount,
} = require("../utils/messageGenerator");

const {
  getBalance,
  approveMax,
  queryRawTokenBalance,
  buyToken,
  sellToken,
  getPairAddress,
  getSellPrice,
} = require("../utils/rpcCalls");

const {
  walletCommand,
  walletResetCommand,
  walletResetConfirmedCommand,
  exportKeyConfirmCommand,
  exportKeyCommand,
  withdrawCompletedCommand,
  depositCommand,
  withdrawToCompleteCommand,
  withdrawEthCommand,
} = require("../commands/walletCommands");

const {
  startCommand,
  refreshCommand,
  emptyCommand,
  closeCommand,
  pinCommand,
  referCommand,
  buyCommand,
  tokenNotFoundCommand,
  checkAddressCommand,
} = require("../commands/globalCommands");

/* async function checkAddressCommand(chatId, userText) {
  // Mainnet
  const startTime = Date.now();

  const data = await queryPool(chatId);
  const balance = await getBalance(data.address, false);

  let pairData = await getPool(userText, "ethereum");
  console.log(pairData);
  if (pairData) {
    const {
      pairAddress,
      baseToken: { symbol, name, address },
      priceUsd,
      liquidity: { base: tokenAmount, quote: wethAmount },
    } = pairData;

    const data = await querySettings(chatId);
    const { leftbuy, rightbuy } = data;
    const priceImpact = calculatePriceImpact(
      rightbuy,
      tokenAmount,
      wethAmount,
      false
    );
    console.log(priceImpact);
    const message = tokenDetailsText(
      symbol,
      name,
      address,
      priceUsd,
      null,
      rightbuy,
      priceImpact,
      balance
    );
    await sendMessageWithButtons(
      chatId,
      message,
      tokenDetailsButtons(address, pairAddress, leftbuy, rightbuy)
    );
  } else {
    await tokenNotFoundCommand(chatId, userText);
  }
  const endTime = Date.now();
  console.log("Time taken:", endTime - startTime);
} */

async function buyTokenCommand(
  chatId,
  callbackQueryId,
  buttonIndex,
  message,
  userText
) {
  try {
    let amount;
    let verifiedUserText;
    const tokenAddress = extractAddressFromString(message);
    const walletData = await queryPool(chatId);
    if (userText) {
      const tokenName = extractTokenNameFromString(message, 1);
      verifiedUserText = await verifyUserText(
        chatId,
        userText,
        tokenName,
        tokenAddress
      );
      if (!verifiedUserText) return;
      else amount = verifiedUserText;
      console.log(amount);
    }
    const query = await querySettings(chatId);
    switch (buttonIndex) {
      case 0:
        amount = query.leftbuy;
        break;
      case 1:
        amount = query.rightbuy;
        break;
    }
    const slippage = query.buyslippage;
    if (amount) {
      const privateKey = decryptPrivateKey(chatId, walletData.encrypted_key);
      const initTxMessage = await sendMessage(
        chatId,
        "Initiating transaction..."
      );
      const messageId = initTxMessage.data.result.message_id;

      const buyTransaction = buyToken(
        amount,
        privateKey,
        walletData.address,
        tokenAddress,
        slippage
      );
      buyTransaction
        .then(async (response) => {
          const approvedToken = await internalBuyCommand(
            response,
            chatId,
            messageId,
            tokenAddress,
            amount,
            walletData.address,
            query,
            callbackQueryId
          );
          if (!approvedToken) {
            const gasPrice = response.gasPrice;
            await internalApprovalCommand(
              chatId,
              tokenAddress,
              privateKey,
              gasPrice
            );
          }
        })
        .catch(async (error) => {
          if (error.hash) {
            await editMessage(
              chatId,
              messageId,
              `<b>Swap failed.</b>\n\nTransaction Hash: ${error.hash}`
            );
          } else if (error.message.startsWith("insufficient funds")) {
            await editMessage(
              chatId,
              messageId,
              `<b>Swap failed.</b>\n\n<b>Error:</b> insufficient funds for intrinsic transaction cost.`
            );
          } else {
            await editMessage(
              chatId,
              messageId,
              `<b>Swap failed.</b>\n\n${error}`
            );
          }
        });
    }
    if (callbackQueryId) await answerCallbackQuery(callbackQueryId, false);
  } catch (error) {
    console.error("Error in buyTokenCommand:", error.message);
  }
}

async function verifyUserText(chatId, userText, tokenName, tokenAddress) {
  if (userText) {
    let data = await queryPool(chatId);
    const balance = await getBalance(data.address, true);
    if (isNaN(userText) || userText > balance || userText <= 0) {
      const message = buyCustomAmount(tokenName, tokenAddress, balance, false);
      await sendMessageWithForcedReply(chatId, message);
    } else return userText;
  }
}

async function promptAmountToBuyCommand(chatId, callbackQueryId, message) {
  try {
    const tokenName = extractTokenNameFromString(message, 0);
    const tokenAddress = extractAddressFromString(message);

    const data = await queryPool(chatId);
    const balance = await getBalance(data.address, true);

    const messageText = buyCustomAmount(tokenName, tokenAddress, balance, true);
    await sendMessageWithForcedReply(chatId, messageText);
    await answerCallbackQuery(callbackQueryId, false);
  } catch (error) {
    console.error("Error in promptAmountToBuyCommand:", error.message);
  }
}

async function refreshTokenPositionsCommand(chatId, message, callbackQueryId) {}

async function internalApprovalCommand(
  chatId,
  tokenAddress,
  privateKey,
  gasPrice
) {
  await approveMax(tokenAddress, privateKey, gasPrice);
  await updateTokenApproval(chatId, tokenAddress);
}

async function internalBuyCommand(
  response,
  chatId,
  messageId,
  tokenAddress,
  amount,
  senderAddress,
  settingQuery,
  callbackQueryId
) {
  console.log(response.txHash);
  console.log(response.gasPrice);
  console.log("Before addTokenIntoDatabase");

  const tokenData = await addTokenIntoDatabase(chatId, tokenAddress, amount);
  const initialEthAmount = tokenData.amount;
  const approvedToken = tokenData.is_approved;
  console.log("After addTokenIntoDatabase");

  await editMessage(
    chatId,
    messageId,
    `<b>Swap Successful.</b>\n\n<b>Transaction Hash:</b> ${response.txHash}`
  );
  console.log("After editMessage");

  const boughtToken = await getTokenInfo(tokenAddress, false);
  console.log(boughtToken);

  const ethBalance = await getBalance(senderAddress, false);
  const { address, symbol, name, decimals, totalSupply } = boughtToken;
  const rawTokenBalance = await queryRawTokenBalance(
    senderAddress,
    tokenAddress
  );
  const fixedTokenBalance = weiToEtherFormat(rawTokenBalance, decimals);
  console.log(fixedTokenBalance);
  const ethValue = await getSellPrice(tokenAddress, rawTokenBalance);
  console.log(ethValue);
  const dollarValue = await getAmountInUSD(ethValue);
  const poolAddress = await getPairAddress("weth", tokenAddress);
  const tokenPrice = await getTokenPriceTestnet(poolAddress);
  const formattedTokenPrice = formatNumber(tokenPrice[0]);
  const marketCap = calculateMarketCap(tokenPrice[0], totalSupply, decimals);

  console.log(marketCap);
  console.log("After tokenBalance");

  const newText = boughtTokenText(
    symbol,
    name,
    address,
    marketCap,
    formattedTokenPrice,
    initialEthAmount,
    formatNumber(fixedTokenBalance),
    parseFloat(ethBalance).toFixed(4),
    ethValue,
    dollarValue
  );
  console.log(newText);
  const newButtons = boughtTokenDetailsButtons(
    name,
    tokenAddress,
    poolAddress,
    settingQuery.leftbuy,
    settingQuery.rightbuy,
    settingQuery.leftsell,
    settingQuery.rightsell
  );
  console.log(newButtons);

  await sendMessageWithButtons(chatId, newText, newButtons);
  console.log("good");
  await answerCallbackQuery(callbackQueryId, false);

  return approvedToken;
}

module.exports = {
  startCommand,
  refreshCommand,
  emptyCommand,
  depositCommand,
  walletCommand,
  walletResetCommand,
  walletResetConfirmedCommand,
  exportKeyCommand,
  exportKeyConfirmCommand,
  closeCommand,
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
  settingCommand,
  customizeSettingsCommand,
  changedSettingCommand,
  buyTokenCommand,
  promptAmountToBuyCommand,
};
