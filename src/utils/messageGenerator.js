/* function generateWelcomeMessage(balance, address) {
  const message = `
  <b>Welcome to GolmonBot</b>

GolmonDAO L1's shittiest bot to trade any coin, and GolmonDAO's official Telegram trading bot.
  
You currently have ${balance} ETH. To get started with trading, send some MOULA to your Golmon wallet address:
  
<code>${address}</code> (tap to copy)
  
Once done, tap refresh, and your balance will appear here.
  
To buy a token, just enter a token address, or even post the birdeye link of the coin.
  
For more info on your wallet and to retrieve your private key, tap the wallet button below. We guarantee the safety of user funds on GolmonBot, but if you expose your private key, your funds will not be safe.
  `;
  return message;
}
 */
function generateWelcomeMessage(balance, address) {
  const message = `🚀 <b>Welcome to CryptoWiz 🧙‍♂️</b>

🌟 <b>Wizardly Wallet 🌟</b>

🪙 <b>Balance:</b> ${balance} ETH ($0.00) #TODO: Add price
🔗 <b>Wallet:</b> <code>${address}</code> (Tap to copy)
  
✨ To begin, send ETH to your wallet. Tap 🔄 <b>Refresh</b> for updates.
  
🧙‍♂️ <b>Casting Spells 🧙‍♀️</b>
To buy a token, share its address or link. CryptoWiz works the magic!
  
📜 <b>Pro Tip:</b> Join @CryptoWizCommunity for tips and discussions.
  
🔐 <b>Caution:</b> Protect your key like treasure. We ensure fund safety, but guard your key wisely.
  
May the crypto spells be ever in your favor! ✨🔮
`;
  return message;
}

function generateWalletMessage(balance, address) {
  const message = `
  <b>Your Wallet</b>

Address: <code>${address}</code>
Balance: ${balance} ETH

Tap to copy the address and send ETH to deposit.`;
  return message;
}

const startButtons = {
  inline_keyboard: [
    [
      { text: "📈 Buy", callback_data: "buyButton" },
      { text: "📊 Sell & Manage", callback_data: "sellManageButton" },
    ],
    [
      { text: "❓ Help", callback_data: "helpButton" },
      { text: "🤝 Refer Friends", callback_data: "referButton" },
      { text: "🚨 Alerts", callback_data: "alertButton" },
    ],
    [
      { text: "💼 Wallet", callback_data: "walletButton" },
      { text: "⚙️ Settings", callback_data: "settingButton" },
    ],
    [
      { text: "📌 Pin", callback_data: "pinButton" },
      { text: "🔄 Refresh", callback_data: "refreshButton" },
    ],
  ],
};

function generateWalletButtons(address) {
  const walletButtons = {
    inline_keyboard: [
      [
        {
          text: "View on Etherscan",
          url: `https://etherscan.io/address/${address}`,
        },
        { text: "Close", callback_data: "closeButton" },
      ],
      [{ text: "Deposit ETH", callback_data: "depositButton" }],
      [
        { text: "Withdraw all ETH", callback_data: "withdrawAllButton" },
        { text: "Withdraw X ETH", callback_data: "withdrawXButton" },
      ],
      [
        { text: "Reset Wallet", callback_data: "walletResetButton" },
        { text: "Export Private Key", callback_data: "exportKeyButton" },
      ],
      [{ text: "Refresh", callback_data: "refreshWalletButton" }],
    ],
  };
  return walletButtons;
}

function resetWalletText(textNum) {
  let text;

  switch (textNum) {
    case 0:
      text = `Are you sure you want to <b>reset</b> your GolmonBot Wallet?

<b>WARNING: This action is irreversible!</b>

GolmonBot will generate a new wallet for you and discard your old one.`;
      break;
    case 1:
      text = `<b>CONFIRM:</b> Are you sure you want to <b>reset</b> your GolmonBot Wallet?

<b>WARNING: This action is irreversible!</b>`;
      break;
  }
  return text;
}

const exportKeyText =
  "Are you sure you want to export your <b>Private Key</b>?";

function walletResetConfirmedText(key, textNum) {
  let text;

  switch (textNum) {
    case 0:
      text = `Your <b>Private Key</b> for your <b>OLD</b> wallet is:

<code>${key}</code> (tap to copy)
You can now import the key into Metamask.
Save this key in case you need to access this wallet again.`;
      break;
    case 1:
      text = `<b>Success:</b> Your new wallet is:
<code>${key}</code> (tap to copy)

You can now send ETH to this address to deposit into your new wallet.
Press refresh to see your new wallet.`;
      break;
  }
  return text;
}
function cancelOrConfirmButtons(actionNum) {
  let confirm_button;

  switch (actionNum) {
    case 0:
      confirm_button = "exportKeyConfirmButton";
      break;
    case 1:
      confirm_button = "resetKeyToConfirmButton";
      break;
    case 2:
      confirm_button = "resetKeyConfirmedButton";
      break;
  }

  const buttons = {
    inline_keyboard: [
      [
        { text: "Cancel", callback_data: `closeButton` },
        { text: "Confirm", callback_data: `${confirm_button}` },
      ],
    ],
  };

  return buttons;
}

function exportKeyConfirmText(key) {
  return `Your <b>Private Key</b> is:
  <code>${key}</code> (tap to copy)
  
You can now import the key into Metamask. 
Please keep your key safe and do not share it with anyone.
Delete this message once you are done.`;
}

function withdrawSwapText(withdrawOrSwap, successOrFailure, txHashOrError) {
  let txText;
  const action = withdrawOrSwap ? "Swap" : "Withdraw";
  const success = successOrFailure ? "Failed" : "Successful";
  if (txHashOrError.startsWith("0x")) {
    txText = `Transaction Hash:
    https://etherscan.io/tx/${txHashOrError}`;
  } else {
    txText = `Error: ${txHashOrError}`;
  }

  const text = `<b>${action} ${success}</b>

${txText}`;

  return text;
}

function tokenNotFoundText(text) {
  return `Token not found. Make sure address (${text}) is correct. You can enter a token address or a Dexscreener link.`;
}

function invalidText(amountOrAddress, text, balance) {
  const invalid = amountOrAddress ? "address" : "amount";
  const correctText = amountOrAddress
    ? "correct Ethereum address"
    : `number between 0 and ${balance}`;
  return `Invalid ${invalid} (${text}) entered.
Please reply with a ${correctText}:`;
}

const depositText = "To deposit, send ETH to below address:";

function addressText(address) {
  return `<code>${address}</code>`;
}

const buyText = `<b>Buy Token:</b>

Enter a token address or dexscreener link to buy:`;

function tokenDetailsText(
  symbol,
  name,
  address,
  price,
  priceChangeObject,
  marketCap,
  priceImpact,
  balance
) {
  const text = `${symbol} | <b>${name}</b> | <code>${address}</code>

📈 <b>Price:</b> $${price}
⌛ <b>5m:</b> ${priceChangeObject.m5}%, 🕒 <b>1h:</b> ${priceChangeObject.h1}%, 🕕 <b>6h:</b> ${priceChangeObject.h6}%, 📆 <b>24h:</b> ${priceChangeObject.h24}%
💰 <b>Market Cap:</b> $${marketCap}
  
🚀 <b>Price Impact (1 ETH):</b> ${priceImpact}%
  
💼 <b>Wallet Balance:</b> ${balance} ETH
🛒 <b>To buy press one of the buttons below.</b>`;

  return text;
}

function tokenDetailsButtons(address, pool) {
  const buttons = {
    inline_keyboard: [
      [{ text: "Cancel", callback_data: "closeButton" }],
      [
        { text: "Explorer", url: `https://etherscan.io/token/${address}` },
        { text: "Pool", url: `https://etherscan.io/token/${pool}` },
        { text: "Chart", url: `https://dexscreener.com/ethereum/${address}` },
        {
          text: "Dextools",
          url: `https://dextools.io/app/en/ether/pair-explorer/${pool}`,
        },
      ],
      [
        { text: "Buy 1 ETH", callback_data: "firstBuyButton" },
        { text: "Buy 5 ETH", callback_data: "secondBuyButton" },
        { text: "Buy X ETH", callback_data: "thirdBuyButton" },
      ],
      [{ text: "Refresh", callback_data: "refreshTokenButton" }],
    ],
  };
  return buttons;
}
const closeButton = {
  inline_keyboard: [[{ text: "Close", callback_data: `closeButton` }]],
};
function stripHtmlTags(text) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findNumbersInDocstring(docstring) {
  // Regular expression to find float or int numbers
  const numberRegex = /[-+]?\d*\.?\d+/g;

  // Match numbers in the docstring
  const matches = docstring.match(numberRegex);

  // Convert matched strings to actual numbers
  const numbers = matches ? matches.map((match) => parseFloat(match)) : [];

  return numbers[0];
}

module.exports = {
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
  withdrawSwapText,
  invalidText,
  findNumbersInDocstring,
  buyText,
  closeButton,
  tokenNotFoundText,
  tokenDetailsText,
  tokenDetailsButtons,
};
