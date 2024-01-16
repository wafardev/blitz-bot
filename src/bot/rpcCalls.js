const { ethers } = require("ethers");
require("dotenv").config();

// Replace with the Ethereum address you want to check the balance for
const rpcUrl = process.env.RPC_URL;

// Create a provider connected to an Ethereum node
const provider = new ethers.providers.WebSocketProvider(rpcUrl);

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

module.exports = { getBalance };
