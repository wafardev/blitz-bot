function generateWalletMessage(balance, address, price) {
  const message = `<b>Your Wallet</b>
    
<b>Address:</b> <code>${address}</code>
<b>Balance:</b> ${balance} ETH ($${price})
    
Tap to copy the address and send ETH to deposit.`;
  return message;
}

function generateWalletButtons(address) {
  const walletButtons = {
    inline_keyboard: [
      [
        {
          text: "View on Sepolia Etherscan",
          url: `https://sepolia.etherscan.io/address/${address}`,
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

function withdrawSuccessOrFailText(failureOrSuccess, txHashOrError) {
  let txText;
  const success = failureOrSuccess ? "Successful" : "Failed";
  if (txHashOrError.startsWith("0x")) {
    txText = `<b>Transaction Hash:</b>\nhttps://sepolia.etherscan.io/tx/${txHashOrError}`;
  } else {
    txText = `Error: ${txHashOrError}`;
  }

  const text = `<b>Withdraw ${success}</b>\n\n${txText}`;

  return text;
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
};
