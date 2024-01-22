const axios = require("axios");

async function getPool(tokenAddress, chain) {
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

function calculatePriceImpact(amount, liquidity) {
  const constantProductFormula = liquidity.base * liquidity.quote;
  const marketPrice = liquidity.quote / liquidity.base;
  const newNativeLiquidity = liquidity.quote + amount;
  const newTokenLiquidity = constantProductFormula / newNativeLiquidity;
  const tokensReceived = liquidity.base - newTokenLiquidity;
  const pricePaidPerToken = amount / tokensReceived;
  const priceImpact = (1 - marketPrice / pricePaidPerToken) * 100;
  return priceImpact.toFixed(2);
}

function formatNumber(value) {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return value; // Return original value if it's not a valid number
  }
  let val = num;
  let exposant = 0;
  const absNum = Math.abs(num);

  if (absNum >= 1e9) {
    return (num / 1e9).toFixed(2) + "B";
  } else if (absNum >= 1e6) {
    return (num / 1e6).toFixed(2) + "M";
  } else if (absNum >= 1e3) {
    return (num / 1e3).toFixed(2) + "K";
  } else if (absNum < 1e-3 && absNum > 1e-6) {
    while (val < 1) {
      val *= 10;
      exposant++;
    }
    val = val.toFixed(2);
    return val / Math.pow(10, exposant);
  } else if (absNum <= 1e-6) {
    while (val < 1) {
      val *= 10;
      exposant++;
    }
    return val.toFixed(2) + "e-" + exposant;
  } else {
    return num.toFixed(2);
  }
}

module.exports = { getPool, calculatePriceImpact, formatNumber };
