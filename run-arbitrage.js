require("dotenv").config();
const Web3 = require("web3");
// Add Abi and addresses
const abis = require("./abis");
////////////////////////
//Allow personal wallet to be added as the admin address
const { mainnet: addresses } = require("./addresses");
/////////////////////////////////////////////////////////
const Flashloan = require("./build/contracts/FlashSwap.json");
//new api goes here. This is the node used to poll the network for prices
const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.WSS_URL)
);
//////////////////////////////////////////////////////////////////////////
const { address: admin } = web3.eth.accounts.wallet.add(
  process.env.PRIVATE_KEY
);

const flashloanBUSD = "10000";
const flashloanWBNB = "100";
const amountInBUSD = web3.utils.toBN(web3.utils.toWei(flashloanBUSD));
const amountInWBNB = web3.utils.toBN(web3.utils.toWei(flashloanWBNB));

//////Adds Token 1 prices(Apeswap in this case)
const ApeSwap = new web3.eth.Contract(
  abis.apeSwap.router,
  addresses.apeSwap.router
);
////////////////////////////////////////////////
//Adds Token 2 prices(Pancakeswap in this case)
const PancakeSwap = new web3.eth.Contract(
  abis.pancakeSwap.router,
  addresses.pancakeSwap.router
);
/////////////////////////////////////////////////
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function stop(reason) {
  throw new Error(reason);
}

const init = async () => {
  const networkId = await web3.eth.net.getId();
  const flashloan = new web3.eth.Contract(
    Flashloan.abi,
    Flashloan.networks[networkId].address
  );
//Shows the new blocks coming in
  web3.eth
    .subscribe("newBlockHeaders")
    .on("data", async (block) => {
      console.log(`New block received. Block # ${block.number}`);
/////////////////////////////////
//Get the prices for Token 1 by calling the contract method getAmountsOut here
      const amountsOut1 = await ApeSwap.methods
        .getAmountsOut(amountInBUSD, [
          addresses.tokens.BUSD,
          addresses.tokens.WBNB,
        ])
        .call();

      const amountsOut2 = await ApeSwap.methods
        .getAmountsOut(amountInWBNB, [
          addresses.tokens.WBNB,
          addresses.tokens.BUSD,
        ])
        .call();
////////////////////////////////////////////////////////////////////
//Get the prices for Token 2 by calling the contract method getAmountsOut here
      const amountsOut3 = await PancakeSwap.methods
        .getAmountsOut(amountInBUSD, [
          addresses.tokens.BUSD,
          addresses.tokens.WBNB,
        ])
        .call();
      const amountsOut4 = await PancakeSwap.methods
        .getAmountsOut(amountInWBNB, [
          addresses.tokens.WBNB,
          addresses.tokens.BUSD,
        ])
        .call();
//////////////////////////////////////////////////////////////////////
//This calculates the price for one and multiplies it by the flashloan amount
      const aperesults = {
        buy: (amountInBUSD / amountsOut1[1]) * flashloanWBNB,
        sell: (amountsOut2[1] / amountInWBNB) * flashloanWBNB,
      };
      const aperesults2 = {
        buy: (amountInWBNB / amountsOut2[1]) * flashloanBUSD,
        sell: (amountsOut1[1] / amountInBUSD) * flashloanBUSD,
      };
//////////////////////////////////////////////////////////////////////////////
//Displays the results in wei
      const pancakeresults = {
        buy: (amountInBUSD / amountsOut3[1]) * flashloanWBNB,
        sell: (amountsOut4[1] / amountInWBNB) * flashloanWBNB,
      };
      const pancakeresults2 = {
        buy: (amountInWBNB / amountsOut4[1]) * flashloanBUSD,
        sell: (amountsOut3[1] / amountInBUSD) * flashloanBUSD,
      };
//////////////////////////////
//Grouping the same route tokens together to make it easier to look at
      console.log(`ApeSwap ${flashloanWBNB} WBNB/BUSD`);
      console.log(aperesults);

      console.log(`PancakeSwap ${flashloanWBNB} WBNB/BUSD`);
      console.log(pancakeresults);

      console.log(`ApeSwap ${flashloanBUSD} BUSD/WBNB`);
      console.log(aperesults2);

      console.log(`PancakeSwap ${flashloanBUSD} BUSD/WBNB`);
      console.log(pancakeresults2);
////////////////////////////////////////////////////////////////////////

     
//Simple calculation for the avg WBNB price is on each exchange
      const pancakeBnbPrice =
        (pancakeresults.buy + pancakeresults.sell) / flashloanWBNB / 2;
      const apeswapBnbPrice =
        (aperesults.buy + aperesults.sell) / flashloanWBNB / 2;
///////////////////////////////////////////////////////////////
//Payback fee calc
      let pancakePaybackCalcBusd = (pancakeresults.buy / 0.997) * 10 ** 18;
      let apeswapPaybackCalcBusd = (aperesults.buy / 0.997) * 10 ** 18;
      let apePaybackCalcWbnb = (aperesults2.buy / 0.997) * 10 ** 18;
      let pancakePaybackCalcWbnb = (pancakeresults2.buy / 0.997) * 10 ** 18;
//////////////////
//Take the price and express it as wei required to payback flashswap. 
//Then calculate $ amount to determine what is needed to be profitable
      let repayBusdPancakeFee =
        pancakePaybackCalcBusd / 10 ** 18 - pancakeresults.buy;
      let repayBusdApeswapFee =
        apeswapPaybackCalcBusd / 10 ** 18 - aperesults.buy;
      let repayWbnbPancakeFee =
        (pancakePaybackCalcWbnb / 10 ** 18 - pancakeresults2.buy) *
        pancakeBnbPrice;
      let repayWbnbApeswapFee =
        (apePaybackCalcWbnb / 10 ** 18 - aperesults2.buy) * apeswapBnbPrice;
/////////////////////////////////////////////////////////////////////////
//Calculate the gas fee and put it into dollar form
      const gasPrice = await web3.eth.getGasPrice();
      const txCost =
        ((330000 * parseInt(gasPrice)) / 10 ** 18) * pancakeBnbPrice;
/////////////////////////////////////////////////////////////////////////
//Add it all together to from our profit calculatoin that is all in dollar amounts
      const profit1 =
        aperesults.sell - pancakeresults.buy - txCost - repayBusdApeswapFee;
      const profit2 =
        pancakeresults.sell - aperesults.buy - txCost - repayBusdPancakeFee;
      const profit3 =
        pancakeresults2.sell - aperesults2.buy - txCost - repayWbnbPancakeFee;
      const profit4 =
        aperesults2.sell - pancakeresults2.buy - txCost - repayWbnbApeswapFee;
//////////////////////////////////////////////////////////////////////////////////
      if (profit1 > 0 && profit1 > profit2) {
        console.log("Arb opportunity found!");
        console.log(`Flashloan WBNB on Apeswap at ${aperesults.buy} `);
        console.log(`Sell WBNB on PancakeSwap at ${pancakeresults.sell} `);
        console.log(`Expected cost of flashswap: ${repayBusdPancakeFee}`);
        console.log(`Expected Gas cost: ${txCost}`);
        console.log(`Expected profit: ${profit1} BUSD`);

        let tx = flashloan.methods.startArbitrage(
          addresses.tokens.WBNB, //token1
          addresses.tokens.BUSD, //token2
          amountInWBNB.toString(), //amount0
          0, //amount1
          addresses.apeSwap.factory, //apefactory
          addresses.pancakeSwap.router, //pancakerouter
          pancakePaybackCalcBusd.toString()
        );

        const data = tx.encodeABI();
        const txData = {
          from: admin,
          to: flashloan.options.address,
          data,
          gas: "330000",
          gasPrice: gasPrice,
        };
        const receipt = await web3.eth.sendTransaction(txData);
        console.log(`Transaction hash: ${receipt.transactionHash}`);
      }

      if (profit2 > 0 && profit2 > profit1) {
        console.log("Arb opportunity found!");
        console.log(`Buy WBNB from PancakeSwap at ${pancakeresults.buy} `);
        console.log(`Sell WBNB from ApeSwap at ${aperesults.sell}`);
        console.log(`Expected cost of flashswap: ${repayBusdApeswapFee}`);
        console.log(`Expected Gas cost: ${txCost}`);
        console.log(`Expected profit: ${profit2} BUSD`);

        let tx = flashloan.methods.startArbitrage(
          addresses.tokens.WBNB, //token1
          addresses.tokens.BUSD, //token2
          amountInWBNB.toString(), //amount0
          0, //amount1
          addresses.pancakeSwap.factory, //pancakefactory
          addresses.apeSwap.router, // aperouter
          apeswapPaybackCalcBusd.toString()
        );
        
        const data = tx.encodeABI();
        const txData = {
          from: admin,
          to: flashloan.options.address,
          data,
          gas: "330000",
          gasPrice: gasPrice,
        };
        const receipt = await web3.eth.sendTransaction(txData);
        console.log(`Transaction hash: ${receipt.transactionHash}`);
      }

      if (profit3 > 0 && profit3 > profit4) {
        console.log("Arb opportunity found!");
        console.log(`Flashloan BUSD on Apeswap at ${aperesults2.buy} `);
        console.log(`Sell BUSD on PancakeSwap at ${pancakeresults2.sell} `);
        console.log(`Expected cost of flashswap: ${repayWbnbApeswapFee}`);
        console.log(`Expected Gas cost: ${txCost}`);
        console.log(`Expected profit: ${profit3} WBNB`);

        let tx = flashloan.methods.startArbitrage(
          addresses.tokens.BUSD, //token1
          addresses.tokens.WBNB, //token2
          0, //amount0
          amountInBUSD.toString(), //amount1
          addresses.apeSwap.factory, //apefactory
          addresses.pancakeSwap.router, //pancakerouter
          apePaybackCalcWbnb.toString()
        );

        const data = tx.encodeABI();
        const txData = {
          from: admin,
          to: flashloan.options.address,
          data,
          gas: "330000",
          gasPrice: gasPrice,
        };
        const receipt = await web3.eth.sendTransaction(txData);
        console.log(`Transaction hash: ${receipt.transactionHash}`);
      }

      if (profit4 > 0 && profit4 > profit3) {
        console.log("Arb opportunity found!");
        console.log(`Flashloan BUSD on PancakeSwap at ${pancakeresults2.buy} `);
        console.log(`Sell BUSD on  at Apeswap ${aperesults2.sell} `);
        console.log(`Expected cost of flashswap: ${repayWbnbPancakeFee}`);
        console.log(`Expected Gas cost: ${txCost}`);
        console.log(`Expected profit: ${profit4} WBNB`);

        let tx = flashloan.methods.startArbitrage(
          //token1
          addresses.tokens.WBNB,
          addresses.tokens.BUSD, //token2
          0, //amount0
          amountInBUSD.toString(), //amount1
          addresses.apeSwap.factory, //apefactory
          addresses.pancakeSwap.router, //pancakerouter
          repayWbnbPancakeFee.toString()
        );

        const data = tx.encodeABI();
        const txData = {
          from: admin,
          to: flashloan.options.address,
          data,
          gas: "330000",
          gasPrice: gasPrice,
        };
        const receipt = await web3.eth.sendTransaction(txData);
        console.log(`Transaction hash: ${receipt.transactionHash}`);
      }
    })
    .on("error", (error) => {
      console.log(error);
    });
};
init();