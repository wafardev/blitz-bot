const axios = require("axios");

const WETHMainnetContractAddress = "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91";

async function getPool(tokenAddress, chain) {
  // for Mainnet
  try {
    const response = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
    );

    if (
      response.data.pairs !== null &&
      response.data.pairs[0].chainId == chain
    ) {
      return response.data.pairs[0];
    } else {
      console.log("No pool found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching pool:", error.message);
    throw error;
  }
}

async function getTokenInfo(address, tokenOrLP) {
  // For Sepolia
  const response = await axios.get(
    `https://sepolia-api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`
  );
  if (tokenOrLP) {
    return response.data.tokens;
  } else {
    return response.data.tokenInfo;
  }
}

async function getAmountInUSD(balance) {
  const ethPrice = await getETHPrice();
  const amountInUSD = balance * ethPrice;

  return amountInUSD.toFixed(2);
}

async function getETHPrice() {
  const response = await axios.get(
    `https://api.dexscreener.com/latest/dex/tokens/${WETHMainnetContractAddress}`
  );
  return response.data.pairs[0].priceUsd;
}

async function getTokenPriceTestnet(poolAddress) {
  try {
    let WETHIndex;

    const WETHPrice = await getETHPrice();

    const response = await getTokenInfo(poolAddress, true);
    if (response[0].tokenInfo.symbol == "WETH") {
      WETHIndex = 0;
    } else if (response[1].tokenInfo.symbol == "WETH") {
      WETHIndex = 1;
    } else {
      console.error("Error:", error.message);
    }
    const WETHAmount = response[WETHIndex].rawBalance * 1;
    const tokenAmount = response[1 - WETHIndex].rawBalance * 1;
    const tokenPrice = (WETHAmount / tokenAmount) * WETHPrice;
    console.log(response);
    console.log("Token Price: " + tokenPrice);
    const tokenPriceData = [tokenPrice, WETHAmount, tokenAmount];
    return tokenPriceData;
  } catch (error) {
    console.error("Error:", error.message);
  }
}

module.exports = {
  getPool,
  getTokenInfo,
  getAmountInUSD,
  getTokenPriceTestnet,
};
