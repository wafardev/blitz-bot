function generateWelcomeMessage(balance, address) {
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
      { text: "Buy", callback_data: "buyButton" },
      { text: "Sell & Manage", callback_data: "sellManageButton" },
    ],
    [
      { text: "Help", callback_data: "helpButton" },
      { text: "Refer Friends", callback_data: "referButton" },
      { text: "Alerts", callback_data: "alertButton" },
    ],
    [
      { text: "Wallet", callback_data: "walletButton" },
      { text: "Settings", callback_data: "settingButton" },
    ],
    [
      { text: "Pin", callback_data: "pinButton" },
      { text: "Refresh", callback_data: "refreshButton" },
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

const resetWalletText = `Are you sure you want to <b>reset</b> your GolmonBot Wallet?

<b>WARNING</b>: This action is irreversible!

GolmonBot will generate a new wallet for you and discard your old one.`;

const exportKeyText =
  "Are you sure you want to export your <b>Private Key</b>?";

function exportOrResetButtons(exportOrReset) {
  let cancel_button;
  let confirm_button;

  if (!exportOrReset) {
    cancel_button = "exportKeyCancelButton";
    confirm_button = "exportKeyConfirmButton";
  } else {
    cancel_button = "resetKeyCancelButton";
    confirm_button = "resetKeyConfirmButton";
  }

  const buttons = {
    inline_keyboard: [
      [
        { text: "Cancel", callback_data: `${cancel_button}` },
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

const depositText = "To deposit, send ETH to below address:";

function addressText(address) {
  return `<code>${address}</code>`;
}

module.exports = {
  generateWelcomeMessage,
  startButtons,
  generateWalletButtons,
  generateWalletMessage,
  depositText,
  addressText,
  exportKeyText,
  exportOrResetButtons,
  exportKeyConfirmText,
  resetWalletText,
};
