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
        { text: "Reset Wallet", callback_data: "walletButton" },
        { text: "Export Private Key", callback_data: "exportKeyButton" },
      ],
      [{ text: "Refresh", callback_data: "refreshWalletButton" }],
    ],
  };
  return walletButtons;
}

module.exports = {
  generateWelcomeMessage,
  startButtons,
  generateWalletButtons,
  generateWalletMessage,
};
