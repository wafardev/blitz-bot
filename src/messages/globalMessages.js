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
function generateWelcomeMessage(balance, address, price) {
  const message = `🚀 <b>Welcome to CryptoWiz 🧙‍♂️</b>
  
🌟 <b>Wizardly Wallet 🌟</b>
  
🪙 <b>Balance:</b> ${balance} ETH ($${price})
🔗 <b>Wallet:</b> <code>${address}</code> (Tap to copy)
    
✨ To begin, send ETH to your wallet. Tap 🔄 <b>Refresh</b> for updates.
    
🧙‍♂️ <b>Casting Spells 🧙‍♀️</b>
To buy a token, share its address or link. CryptoWiz works the magic!
    
📜 <b>Pro Tip:</b> Join @CryptoWizCommunity for tips and discussions.
    
🔐 <b>Caution:</b> Protect your key like treasure. We ensure fund safety, but guard your key wisely.
    
May the crypto spells be ever in your favor! ✨🔮`;

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

const closeButton = {
  inline_keyboard: [[{ text: "Close", callback_data: `closeButton` }]],
};

module.exports = { generateWelcomeMessage, startButtons, closeButton };
