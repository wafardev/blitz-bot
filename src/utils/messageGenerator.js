const {
  generateWelcomeMessage,
  startButtons,
  closeButton,
} = require("../messages/globalMessages");

const {
  generateWalletMessage,
  generateWalletButtons,
  resetWalletText,
  exportKeyText,
  walletResetConfirmedText,
  cancelOrConfirmButtons,
  exportKeyConfirmText,
  depositText,
  addressText,
  withdrawSuccessOrFailText,
} = require("../messages/walletMessages");

const {
  settingsText,
  settingButtons,
  defaultSettings,
  changeSettingText,
  modifiedSettingText,
} = require("../messages/settingMessages");
const { parse } = require("dotenv");

function swapSuccessOrFailText(failureOrSuccess, txHashOrError) {
  let txText;
  const success = failureOrSuccess ? "Successful" : "Failed";
  if (txHashOrError.startsWith("0x")) {
    txText = `Transaction Hash:
    https://sepolia.etherscan.io/tx/${txHashOrError}`;
  } else {
    txText = `Error: ${txHashOrError}`;
  }

  const text = `<b>Swap ${success}</b>\n\n${txText}`;

  return text;
}

function tokenNotFoundText(text) {
  return `Token not found.\nMake sure address (${text}) is correct.`;
}

function invalidText(amountOrAddress, text, balance) {
  const invalid = amountOrAddress ? "address" : "amount";
  const correctText = amountOrAddress
    ? "correct Ethereum address"
    : `number between 0 and ${balance.toFixed(6)}`;
  return `Invalid ${invalid} (${text}) entered.
Please reply with a ${correctText}:`;
}

const buyText = `<b>Buy Token:</b>

Enter a token address to buy:`;

function buyCustomAmount(tokenName, tokenAddress, balance, validBool) {
  let correctText;
  balance = parseFloat(balance);
  if (!validBool) {
    correctText = `Invalid amount entered.\nPlease reply with a number between 0 and ${balance.toFixed(
      6
    )}:`;
  } else
    correctText = `Reply with the amount you wish to buy (0 - ${balance.toFixed(
      6
    )} ETH, Example: 0.1):`;
  const text = `You are buying ${tokenName} (${tokenAddress}).\n\n${correctText}`;
  return text;
}

function sellCustomAmount() {
  const text = `You are selling ${tokenName} (${tokenAddress}).\n\nReply with the amount in % you wish to sell (0 - 100%, Example: 50):`;
}

function tokenDetailsText(
  symbol,
  name,
  address,
  price,
  // priceChangeObject,
  marketCap,
  priceImpactAmount,
  priceImpact,
  balance
) {
  let priceImpactText;
  if (priceImpact > 5) priceImpactText = `⚠️ ${priceImpact}%`;
  else priceImpactText = `${priceImpact}%`;
  const text = `${symbol} | <b>${name}</b> | <code>${address}</code>

📈 <b>Price:</b> $${price}
⌛ <b>5m:</b> NaN%, 🕒 <b>1h:</b> NaN%, 🕕 <b>6h:</b> NaN%, 📆 <b>24h:</b> NaN%
💰 <b>Market Cap:</b> $${marketCap}
  
🚀 <b>Price Impact (${priceImpactAmount} ETH):</b> ${priceImpactText}
  
💼 <b>Wallet Balance:</b> ${balance} ETH
🛒 <b>To buy press one of the buttons below.</b>`;

  return text;
}

function tokenDetailsButtons(address, pool, leftBuyAmount, rightBuyAmount) {
  const buttons = {
    inline_keyboard: [
      [{ text: "Cancel", callback_data: "closeButton" }],
      [
        {
          text: "Explorer",
          url: `https://sepolia.etherscan.io/token/${address}`,
        },
        { text: "Pool", url: `https://sepolia.etherscan.io/token/${pool}` },
        { text: "Chart", url: `https://dexscreener.com/ethereum/${address}` },
        {
          text: "Dextools",
          url: `https://dextools.io/app/en/ether/pair-explorer/${pool}`,
        },
      ],
      [
        { text: `Buy ${leftBuyAmount} ETH`, callback_data: "firstBuyButton" },
        { text: `Buy ${rightBuyAmount} ETH`, callback_data: "secondBuyButton" },
        { text: "Buy X ETH", callback_data: "thirdBuyButton" },
      ],
      [
        {
          text: "Refresh",
          callback_data: "refreshTokenButton",
        },
      ],
    ],
  };
  return buttons;
}

function boughtTokenText(
  symbol,
  name,
  address,
  marketCap,
  tokenPrice,
  ethAmount,
  tokenBalance,
  walletBalance,
  ethValue,
  dollarValue
) {
  const profitPercentage = ((ethValue - ethAmount) / ethAmount) * 100;
  const text = `${symbol} | <b>${name}</b> | <code>${address}</code>

📈 <b>Profit:</b> ${profitPercentage.toFixed(2)}% / ${(
    ethValue - ethAmount
  ).toFixed(4)} ETH
📈 <b>Value:</b> $${dollarValue} / ${parseFloat(ethValue).toFixed(4)} ETH
💰 <b>Market Cap:</b> $${marketCap} @ ${tokenPrice}
📊 <b>5m</b>: NaN%
  
📈 <b>Net profit:</b> $NaN / NaN ETH
💼 <b>Initial:</b> ${parseFloat(ethAmount).toFixed(4)} ETH
💼 <b>Balance:</b> ${tokenBalance} ${name}
💼 <b>Wallet Balance:</b> ${walletBalance} ETH`;

  return text;
}

function boughtTokenDetailsButtons(
  tokenName,
  address,
  pool,
  leftBuyAmount,
  rightBuyAmount,
  leftSellAmount,
  rightSellAmount
) {
  const buttons = {
    inline_keyboard: [
      [{ text: "Close", callback_data: "closeButton" }],
      [
        { text: `Buy ${leftBuyAmount} ETH`, callback_data: "firstBuyButton" },
        { text: `Buy ${rightBuyAmount} ETH`, callback_data: "secondBuyButton" },
        { text: "Buy X ETH", callback_data: "thirdBuyButton" },
      ],
      [
        { text: "Prev", callback_data: `prevButton` },
        { text: `${tokenName}`, callback_data: `emptyButton` },
        { text: "Next", callback_data: `nextButton` },
      ],
      [
        {
          text: "Explorer",
          url: `https://sepolia.etherscan.io/token/${address}`,
        },
        { text: "Pool", url: `https://sepolia.etherscan.io/token/${pool}` },
        { text: "Chart", url: `https://dexscreener.com/ethereum/${address}` },
        {
          text: "Dextools",
          url: `https://dextools.io/app/en/ether/pair-explorer/${pool}`,
        },
      ],
      [
        { text: `Sell ${leftSellAmount}%`, callback_data: "firstSellButton" },
        { text: `Sell ${rightSellAmount}%`, callback_data: "secondSellButton" },
        { text: "Sell X %", callback_data: "thirdSellButton" },
      ],
      [
        {
          text: "Refresh",
          callback_data: "refreshTokenPositionsButton",
        },
      ],
    ],
  };
  return buttons;
}

module.exports = {
  changeSettingText,
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
  swapSuccessOrFailText,
  withdrawSuccessOrFailText,
  invalidText,
  buyText,
  closeButton,
  tokenNotFoundText,
  tokenDetailsText,
  tokenDetailsButtons,
  settingButtons,
  settingsText,
  defaultSettings,
  modifiedSettingText,
  boughtTokenDetailsButtons,
  boughtTokenText,
  buyCustomAmount,
};
