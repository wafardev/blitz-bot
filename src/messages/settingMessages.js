const settingsText = `<b>Settings:</b>
  
<b>GENERAL SETTINGS</b>

<b>GolmonBot Announcements:</b> Occasional announcements. Tap to toggle. #TODO: Add announcements
<b>Minimum Position Value:</b> Minimum position value to show in portfolio. Will hide tokens below this threshhold. Tap to edit. #TODO: Add minimum position value

<b>AUTO BUY</b> #TODO: Add auto buy

Immediately buy when pasting token address. Tap to toggle.

<b>BUTTONS CONFIG</b>

Customize your buy and sell buttons for buy token and manage position. Tap to edit.

<b>SLIPPAGE CONFIG</b>

Customize your slippage settings for buys and sells. Tap to edit.
Max Price Impact is to protect against trades in extremely illiquid pools.

<b>TRANSACTION PRIORITY</b>

Increase your Transaction Priority to improve transaction speed. Select preset or tap to edit.

<b>MEV PROTECT</b> #TODO: Add MEV protect

MEV Protect accelerates your transactions and protect against frontruns to make sure you get the best price possible.
<b>Turbo:</b> BONKbot will use MEV Protect, but if unprotected sending is faster it will use that instead.
<b>Secure:</b> Transactions are guaranteed to be protected. This is the ultra secure option, but may be slower.`;

function settingButtons(
  leftBuyNumber,
  rightBuyNumber,
  leftSellNumber,
  rightSellNumber,
  buySlippageNumber,
  sellSlippageNumber,
  priceImpactNumber
) {
  const buttons = {
    inline_keyboard: [
      [{ text: "--- GENERAL SETTINGS ---", callback_data: "emptyButton" }],
      [
        {
          text: "Announcements (coming soon)",
          callback_data: "announcementsButton",
        },
        {
          text: "Min Pos Value(todo): ${minPosValue}",
          callback_data: "minPositionValueButton",
        },
      ],
      [{ text: "--- AUTO BUY ---(todo)", callback_data: "emptyButton" }],
      [
        { text: "${autoBuyBool}", callback_data: "autoBuyButton" },
        { text: "✏️ 0.1 ETH", callback_data: "buttonsConfigButton" },
      ],
      [{ text: "--- BUY BUTTONS CONFIG ---", callback_data: "emptyButton" }],
      [
        {
          text: `✏️ Left: ${leftBuyNumber} ETH`,
          callback_data: "leftBuySettingButton",
        },
        {
          text: `✏️ Right: ${rightBuyNumber} ETH`,
          callback_data: "rightBuySettingButton",
        },
      ],
      [{ text: "--- SELL BUTTONS CONFIG ---", callback_data: "emptyButton" }],
      [
        {
          text: `✏️ Left: ${leftSellNumber}%`,
          callback_data: "leftSellSettingButton",
        },
        {
          text: `✏️ Right: ${rightSellNumber}%`,
          callback_data: "rightSellSettingButton",
        },
      ],
      [{ text: "--- SLIPPAGE CONFIG ---", callback_data: "emptyButton" }],
      [
        {
          text: `✏️ Buy: ${buySlippageNumber}%`,
          callback_data: "buySlippageSettingButton",
        },
        {
          text: `✏️ Sell: ${sellSlippageNumber}%`,
          callback_data: "sellSlippageSettingButton",
        },
      ],
      [
        {
          text: `✏️ Max Price Impact: ${priceImpactNumber}%`,
          callback_data: "priceImpactSettingButton",
        },
      ],
      [{ text: "--- MEV PROTECT ---", callback_data: "emptyButton" }],
      [
        {
          text: "🔄 Turbo or Normal (TODO)",
          callback_data: "mevProtectButton",
        },
      ],
      [{ text: "--- TRANSACTION PRIORITY ---", callback_data: "emptyButton" }],
      [
        { text: "🔄 Medium (TODO)", callback_data: "txPriorityButton" },
        { text: `✏️ ETH`, callback_data: "closeButton" },
      ],
      [{ text: "Close", callback_data: "closeButton" }],
    ],
  };
  return buttons;
}

const defaultSettings = [
  0.1, // leftBuy
  0.5, // rightBuy
  25, // leftSell
  100, // rightSell
  10.0, // buySlippage
  10.0, // sellSlippage
  25, // priceImpact
];

function changeSettingText(settingNum) {
  let text;
  switch (settingNum) {
    case 0:
      text =
        "Enter your new setting for the left buy button (in ETH). Example: 0.5";
      break;
    case 1:
      text =
        "Enter your new setting for the right buy button (in ETH). Example: 1.5";
      break;
    case 2:
      text =
        "Enter your new setting for the left sell button in % (1 - 100%). Example: 25";
      break;
    case 3:
      text =
        "Enter your new setting for the left sell button in % (1 - 100%). Example: 100";
      break;
    case 4:
      text = "Enter your new buy slippage in % (0 - 50%). Example: 4.5";
      break;
    case 5:
      text = "Enter your new sell slippage in % (0 - 50%). Example: 5.5";
      break;
    case 6:
      text =
        "Enter your new max price impact setting in % (1 - 100%). Example: 25";
      break;
    default:
      text = "Invalid setting number";
      break;
  }
  return text;
}

function modifiedSettingText(settingNum, changedValue) {
  let text;

  switch (settingNum) {
    case 0:
      text = `Your new setting for the left buy button is ${changedValue} ETH.`;
      break;
    case 1:
      text = `Your new setting for the right buy button is ${changedValue} ETH.`;
      break;
    case 2:
      text = `Your new setting for the left sell button is ${changedValue}%.`;
      break;
    case 3:
      text = `Your new setting for the right sell button is ${changedValue}%.`;
      break;
    case 4:
      text = `Your new buy slippage is ${changedValue}%.`;
      break;
    case 5:
      text = `Your new sell slippage is ${changedValue}%.`;
      break;
    case 6:
      text = `Your new max price impact setting is ${changedValue}%.`;
      break;
  }
  return text;
}

module.exports = {
  settingsText,
  settingButtons,
  defaultSettings,
  changeSettingText,
  modifiedSettingText,
};
