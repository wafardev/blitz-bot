const { ethers } = require("ethers");
require("dotenv").config();

// Replace with the Ethereum address you want to check the balance for
const testRpcUrl = process.env.TEST_RPC_URL;

// Create a provider connected to an Ethereum node
const provider = new ethers.providers.JsonRpcProvider(testRpcUrl);

// Fetch the balance
async function getBalance(address) {
  try {
    const balanceWei = await provider.getBalance(address);
    // Convert balance from Wei to Ether
    const balanceEther = ethers.utils.formatEther(balanceWei);
    if (balanceEther == 0) {
      return "0";
    } else return balanceEther;
  } catch (error) {
    console.error("Error fetching balance:", error.message);
  }
}

async function withdrawEth(privateKey, toAddress, amount) {
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
      console.error("Balance is not enough to cover the gas fee.");
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
  } catch (error) {
    console.error("Error:", error.message);
  }
}

const privateKey =
  "0x03a3cb572b0ad0db23d7fdca2feaaafda65d81ec876bdff38b590bc9bf8cb028";
const toAddress = "0x46abc91948426088cb81d630ac7f0bfe6ccbbac9";

withdrawEth(privateKey, toAddress);
