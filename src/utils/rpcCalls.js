const { ethers } = require("ethers");
require("dotenv").config();

// Replace with the Ethereum address you want to check the balance for
const rpcUrl = process.env.RPC_URL;

// Create a provider connected to an Ethereum node
/* const provider = new ethers.providers.WebSocketProvider(rpcUrl); */
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

// Fetch the balance
async function getBalance(address, withGas) {
  try {
    const balanceWei = await provider.getBalance(address);
    // Convert balance from Wei to Ether
    const balanceEther = ethers.utils.formatEther(balanceWei);
    if (balanceEther == 0) {
      return "0";
    } else if (withGas) {
      const gasPrice = await provider.getGasPrice();
      const gasEstimate = ethers.BigNumber.from(21000);
      const totalGasCost = gasPrice.mul(gasEstimate);
      const sentBalance = balanceWei.sub(totalGasCost);
      return ethers.utils.formatEther(sentBalance);
    }
    return balanceEther;
  } catch (error) {
    console.error("Error fetching balance:", error.message);
  }
}

async function withdrawEth(privateKey, toAddress, amount) {
  return new Promise(async (resolve, reject) => {
    try {
      let amountToSend;
      // Create a wallet using the private key
      const wallet = new ethers.Wallet(privateKey, provider);

      // Get the balance of the wallet
      const totalBalance = await wallet.getBalance();
      if (amount)
        amountToSend = ethers.utils.parseUnits(amount.toString(), "ether");
      else amountToSend = totalBalance;

      console.log("Send amount:", amountToSend.toString());

      const gasPrice = await provider.getGasPrice();

      // Estimate gas for the transaction
      const gasEstimate = ethers.BigNumber.from(21000);

      const totalGasCost = gasPrice.mul(gasEstimate);

      if (amountToSend.lt(totalGasCost)) {
        reject("Not enough balance to cover the gas fee.");
      }

      const sentBalance = amountToSend.sub(totalGasCost);
      console.log("Total gas cost: " + totalGasCost.toString());

      // Withdraw all Ether to the specified address
      const transaction = await wallet.sendTransaction({
        to: toAddress,
        value: sentBalance,
        gasPrice: gasPrice,
        gasLimit: gasEstimate,
      });

      const afterBalance = await wallet.getBalance();
      console.log("After balance:", afterBalance.toString());

      console.log(`Withdrawal transaction hash: ${transaction.hash}`);
      resolve(transaction.hash);
    } catch (error) {
      // If an error occurs, reject the Promise with the error
      reject(error);
    }
  });
}

module.exports = { getBalance, withdrawEth };
