const Wallet = require("ethereumjs-wallet").default;

function generateNewWallet() {
  const wallet = Wallet.generate();

  const userAddress = wallet.getAddressString();
  const privateKey = wallet.getPrivateKeyString();
  return { privateKey, userAddress };
}

module.exports = generateNewWallet;
