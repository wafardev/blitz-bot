const { ethers } = require("ethers");
const IUniswapV2Router02ABI = require("../interfaces/IUniswapV2Router02ABI.json");
const ERC20ABI = require("../interfaces/ERC20ABI.json");
const IUniswapV2FactoryABI = require("../interfaces/IUniswapV2FactoryABI.json");
const Decimal = require("decimal.js");
require("dotenv").config();

const rpcUrl = process.env.RPC_URL;

/* const provider = new ethers.providers.WebSocketProvider(rpcUrl); */
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

const sepoliaRouterAddress = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008"; // Uniswap V2 Router address on Sepolia
const sepoliaFactoryAddress = "0x7E0987E5b3a30e3f2828572Bb659A548460a3003"; // Uniswap V2 Factory address on Sepolia
const sepoliaWETHContractAddress = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9"; // WETH address on Sepolia

async function getGasPrice() {
  const gasPrice = await provider.getGasPrice();
  const aggressiveGasPrice = gasPrice.add(gasPrice.div(4));
  return aggressiveGasPrice;
}

async function getBalance(address, withGas) {
  try {
    const balanceWei = await provider.getBalance(address);

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

async function withdrawEth(privateKey, toAddress, chain, amount) {
  return new Promise(async (resolve, reject) => {
    try {
      let chainId;
      const wallet = new ethers.Wallet(privateKey, provider);

      let amountToSend;
      if (amount) {
        amountToSend = ethers.utils.parseUnits(amount.toString(), "ether");
      } else {
        amountToSend = await wallet.getBalance();
      }

      console.log("Send amount:", amountToSend.toString());

      const gasEstimate = await wallet.estimateGas({
        to: toAddress,
        value: amountToSend,
      });

      const nonce = await wallet.getTransactionCount();

      let gasPrice = await provider.getGasPrice();

      console.log("Gas price:", gasPrice.toString());

      const totalGasCost = gasPrice.mul(gasEstimate);

      if (amountToSend.lt(totalGasCost)) {
        reject("Not enough balance to cover the gas fee.");
        return;
      }

      if (chain == "sepolia") chainId = 11155111;

      const sentBalance = amountToSend.sub(totalGasCost);
      console.log("Total gas cost: " + totalGasCost.toString());

      const transactionStructure = {
        to: toAddress,
        value: sentBalance,
        gasPrice: gasPrice,
        gasLimit: gasEstimate,
        nonce: nonce,
        chainId: chainId,
      };

      const transaction = await wallet.sendTransaction(transactionStructure);

      const afterBalance = await wallet.getBalance();
      console.log("After balance:", afterBalance.toString());

      console.log(`Withdrawal transaction hash: ${transaction.hash}`);
      resolve(transaction.hash);
    } catch (error) {
      reject(error.message);
    }
  });
}

async function approveMax(tokenAddress, privateKey, gasPrice, routerAddress) {
  try {
    const maxAllowance = ethers.constants.MaxUint256;

    const wallet = new ethers.Wallet(privateKey, provider);
    const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, wallet);

    if (!routerAddress) routerAddress = sepoliaRouterAddress;

    const approveTx = await tokenContract.approve(routerAddress, maxAllowance, {
      gasPrice,
    });
    await approveTx.wait();
    console.log("Token approval successful: " + approveTx.hash);
    const approveTime = Date.now();
    console.log(
      "Time taken for Approve: " + (approveTime - buyTime) / 1000 + " seconds"
    );
  } catch (error) {
    console.error("Error in approveMax:", error.message);
  }
}

async function queryRawTokenBalance(addressToQuery, tokenAddress) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
    const rawBalance = await tokenContract.balanceOf(addressToQuery);

    console.log(`Raw Balance of ${addressToQuery}: ${rawBalance.toString()}`);
    return rawBalance;
  } catch (error) {
    console.error("Error querying token balance:", error.message);
  }
}

async function getPairAddress(tokenA, tokenB, factoryAddress) {
  try {
    if (tokenA === "weth") tokenA = sepoliaWETHContractAddress;
    if (!factoryAddress) factoryAddress = sepoliaFactoryAddress;
    const factoryContract = new ethers.Contract(
      factoryAddress,
      IUniswapV2FactoryABI,
      provider
    );
    const pairAddress = await factoryContract.getPair(tokenA, tokenB);
    console.log(`Liquidity Pool Address: ${pairAddress}`);
    return pairAddress;
  } catch (error) {
    console.error("Error getting liquidity pool address:", error.message);
  }
}

async function buyToken(
  amount,
  privateKey,
  senderAddress,
  tokenAddress,
  slippage,
  wethAddress,
  routerAddress
) {
  return new Promise(async (resolve, reject) => {
    try {
      const startTime = Date.now();

      const amountIn = ethers.utils.parseEther(amount.toString());
      const wallet = new ethers.Wallet(privateKey, provider);

      if (!routerAddress) routerAddress = sepoliaRouterAddress;
      const routerContract = new ethers.Contract(
        routerAddress,
        IUniswapV2Router02ABI,
        provider
      );

      if (!wethAddress) wethAddress = sepoliaWETHContractAddress;

      const buyPath = [wethAddress, tokenAddress];
      const amountOutMin = await routerContract.getAmountsOut(
        amountIn,
        buyPath
      );
      const slippageAdjustedAmountOutMin = amountOutMin[1].sub(
        amountOutMin[1].mul(slippage).div(100)
      );

      const gasPrice = await getGasPrice();
      const deadline = Math.floor(Date.now() / 1000) + 30; // 30 seconds from now

      const transaction = await routerContract
        .connect(wallet)
        .swapExactETHForTokens(
          slippageAdjustedAmountOutMin,
          buyPath,
          senderAddress,
          deadline,
          { value: amountIn, gasPrice }
        );

      await transaction.wait();

      const txHash = `https://sepolia.etherscan.io/tx/${transaction.hash}`;

      console.log("Token purchase successful: " + transaction.hash);

      const buyTime = Date.now();
      console.log(
        "Time taken for Buy: " + (buyTime - startTime) / 1000 + " seconds"
      );
      resolve({ txHash, gasPrice });
    } catch (error) {
      console.error("Error during token purchase:", error.message);
      if (error.transactionHash) {
        // If the error contains a transaction hash, include it in the rejection
        reject({ error, transactionHash: error.transactionHash });
      } else {
        reject(error);
      }
    }
  });
}

async function sellToken(
  percentage,
  privateKey,
  senderAddress,
  tokenAddress,
  slippage,
  wethAddress,
  routerAddress
) {
  const startTime = Date.now();
  if (percentage > 100 || percentage <= 0) {
    console.error("Percentage must be between 1 and 100");
  } else {
    try {
      const wallet = new ethers.Wallet(privateKey, provider);

      const tokenBalance = await queryTokenBalance(
        senderAddress,
        tokenAddress,
        false
      );
      const tokensToSell = tokenBalance.mul(percentage).div(100);

      if (!wethAddress) wethAddress = sepoliaWETHContractAddress;
      if (!routerAddress) routerAddress = sepoliaRouterAddress;
      const routerContract = new ethers.Contract(
        routerAddress,
        IUniswapV2Router02ABI,
        provider
      );

      const sellPath = [tokenAddress, wethAddress];
      const amountOutMin = await routerContract.getAmountsOut(
        tokensToSell,
        sellPath
      );
      console.log(amountOutMin[1].toString());
      const slippageAdjustedAmountOutMin = amountOutMin[1].sub(
        amountOutMin[1].mul(slippage).div(100)
      );

      const gasPrice = await getGasPrice();
      const deadline = Math.floor(Date.now() / 1000) + 30; // 30 seconds from now

      const sellTx = await routerContract
        .connect(wallet)
        .swapExactTokensForETH(
          tokensToSell,
          slippageAdjustedAmountOutMin,
          sellPath,
          senderAddress,
          deadline,
          { gasPrice }
        );

      await sellTx.wait();

      console.log("Token sale successful: " + sellTx.hash);
      const endTime = Date.now();
      console.log(
        "Time taken for Sell: " + (endTime - startTime) / 1000 + " seconds"
      );
    } catch (error) {
      console.error("Error:", error.message);
    }
  }
}

async function getSellPrice(
  tokenAddress,
  tokensToSell,
  wethAddress,
  routerAddress
) {
  if (!wethAddress) wethAddress = sepoliaWETHContractAddress;
  if (!routerAddress) routerAddress = sepoliaRouterAddress;

  const routerContract = new ethers.Contract(
    routerAddress,
    IUniswapV2Router02ABI,
    provider
  );

  const sellPath = [tokenAddress, wethAddress];
  const amountOutMin = await routerContract.getAmountsOut(
    tokensToSell,
    sellPath
  );
  console.log("Output: " + amountOutMin[1]);

  const numerator = new Decimal(amountOutMin[1].toString());
  const denominator = new Decimal(10).pow(18);

  const result = numerator.div(denominator);

  console.log(result.toString());
  return result.toString();
}

module.exports = {
  getBalance,
  withdrawEth,
  approveMax,
  getPairAddress,
  queryRawTokenBalance,
  buyToken,
  sellToken,
  getSellPrice,
};
