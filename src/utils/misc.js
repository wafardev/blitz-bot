const Decimal = require("decimal.js");

function stripHtmlTags(text) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findNumbersInDocstring(docstring) {
  const numberRegex = /[-+]?\d*\.?\d+/g;

  const matches = docstring.match(numberRegex);

  const numbers = matches ? matches.map((match) => parseFloat(match)) : [];

  return numbers[0];
}

function extractTokenNameFromString(text, regexBool) {
  const regex = regexBool ? /You are buying (\w+) \(/ : /\| (\w+) \|/; // Define a regular expression to match the name

  const match = text.match(regex);

  const tokenName = match ? match[1] : null;

  return tokenName;
}

function extractAddressFromString(text) {
  const regex = /0x[a-fA-F0-9]{40}/; // Regular expression for Ethereum address
  const match = text.match(regex);

  return match ? match[0] : null;
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
    console.log("ye");
    while (val < 1) {
      val *= 10;
      exposant++;
    }
    val = val.toFixed(2);
    const value = new Decimal(val);
    const divisor = new Decimal(10).pow(5);

    const result = value.dividedBy(divisor);

    return result.toString();
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

function weiToEtherFormat(value, decimals) {
  return value / 10 ** decimals;
}

function calculatePriceImpact(amount, tokenAmount, wethAmount, buyOrSell) {
  if (amount <= 0) {
    throw new Error("Invalid amount");
  }
  const constantProductFormula = tokenAmount * wethAmount;
  const marketPrice = wethAmount / tokenAmount;

  const addedLiquidity = buyOrSell ? tokenAmount + amount : wethAmount + amount;

  const newLiquidity = constantProductFormula / addedLiquidity;
  const newWethAmount = buyOrSell ? newLiquidity : addedLiquidity;
  const newTokenAmount = buyOrSell ? addedLiquidity : newLiquidity;

  const wethReceivedOrTokensReceived = buyOrSell
    ? wethAmount - newWethAmount
    : tokenAmount - newTokenAmount;

  const pricePaidOrReceivedPerToken = buyOrSell
    ? wethReceivedOrTokensReceived / amount
    : amount / wethReceivedOrTokensReceived;

  const priceImpact = buyOrSell
    ? (1 - pricePaidOrReceivedPerToken / marketPrice) * 100
    : (1 - marketPrice / pricePaidOrReceivedPerToken) * 100;

  return priceImpact.toFixed(2);
}

function calculateMarketCap(tokenPrice, tokenSupply, decimals) {
  const marketCap = tokenPrice * (tokenSupply / 10 ** decimals);
  const formattedMarketCap = formatNumber(marketCap);
  return formattedMarketCap;
}

module.exports = {
  stripHtmlTags,
  findNumbersInDocstring,
  formatNumber,
  calculatePriceImpact,
  extractAddressFromString,
  calculateMarketCap,
  weiToEtherFormat,
  extractTokenNameFromString,
};
