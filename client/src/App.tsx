import React, { useState, useEffect } from "react";
import DRajuTokenSale from "./contracts/DRajuTokenSale.json";
import DRaju from "./contracts/DRaju.json";
import getWeb3 from "./getWeb3";
import BuyToken from "./components/BuyToken";
import "./App.css";
import { makeStyles } from "@material-ui/core";
import CoinStats from "./components/CoinStats";

const App: React.FC = () => {
  const [, setWeb3] = useState();
  const [accounts, setAccounts] = useState<Array<string>>([]);
  const [tokenSaleContract, setTokenSaleContract] = useState<any>();
  const [tokenContract, setTokenContract] = useState<any>();
  const [tokenAttributes, setTokenAttributes] =
    useState<tokenAttributes | null>(null);
  const [tokensRemaining, setTokensRemaining] = useState<number>(100000);

  const connectToWeb3 = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      setWeb3(web3);

      // Use web3 to get the user's accounts.
      const currAccounts = await web3.eth.getAccounts();
      setAccounts(currAccounts);

      // Get the blockchain network our smart contracts are on
      const networkId = await web3.eth.net.getId();

      //Get the networks object of the DRajuTokenSale smart contract on this network
      let networks: any = DRajuTokenSale.networks;
      let deployedNetwork = networks[networkId];

      //Get the instance of the smart contract on the network using its ABI and
      //the address of the smart contract on the network

      const tokenSale = new web3.eth.Contract(
        DRajuTokenSale.abi,
        deployedNetwork && deployedNetwork.address
      );

      setTokenSaleContract(tokenSale);

      const price = await tokenSale.methods
        .tokenPrice()
        .call({ from: currAccounts[0] });

      console.log("price: ", price);

      console.log("TOKEN SALE CONTRACT");
      console.log(tokenSale._address);
      // const tokenSaleAddress = await tokenSale.address();
      // console.log("TOKEN SALE ADDRESS: ", tokenSaleAddress);
      networks = DRaju.networks;
      deployedNetwork = networks[networkId];
      const tokenInstance = new web3.eth.Contract(
        DRaju.abi,
        deployedNetwork && deployedNetwork.address
      );
      console.log("Token Instance: ", tokenInstance._address);

      const name = await tokenInstance.methods
        .name()
        .call({ from: currAccounts[0] });

      console.log("Name: ", name);

      const symbol = await tokenInstance.methods
        .symbol()
        .call({ from: currAccounts[0] });

      let totalSupply = await tokenInstance.methods
        .totalSupply()
        .call({ from: currAccounts[0] });
      totalSupply = parseInt(totalSupply, 10);

      let tokenPrice = await tokenSale.methods
        .tokenPrice()
        .call({ from: currAccounts[0] });
      tokenPrice = parseInt(tokenPrice, 10);

      const tokenAttributes: tokenAttributes = {
        name: name,
        symbol: symbol,
        totalSupply: totalSupply,
        tokenPrice: tokenPrice,
      };
      console.log(tokenAttributes);
      setTokenAttributes(tokenAttributes);
      setTokenContract(tokenInstance);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  const getCoingRemainingForSale = async () => {
    if (tokenSaleContract === undefined || !tokenAttributes) {
      new Error(
        "TokenContract has not been deployed or token attributes not present"
      );
      return;
    }
    const tokensSold = await tokenSaleContract.methods.tokensSold().call();
    console.log(
      "tokens remaining for sale: ",
      tokenAttributes.totalSupply - tokensSold
    );
    setTokensRemaining(tokenAttributes.totalSupply - tokensSold);
  };

  const buyTokenCallback = async (amount: number) => {
    try {
      if (!tokenAttributes) throw new Error("Token attributes do not exist");
      const payment = amount * tokenAttributes.tokenPrice;

      const reciept = await tokenSaleContract.methods
        .buyTokens(amount)
        .send({ from: accounts[0], value: payment });
      await getCoingRemainingForSale();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    connectToWeb3();
    getCoingRemainingForSale();
  }, [connectToWeb3]);

  const classes = useStyles();

  let soldPercentage =
    tokensRemaining && tokenAttributes && tokenAttributes.totalSupply
      ? (tokensRemaining / tokenAttributes.totalSupply) * 100
      : 0;
  soldPercentage = 100 - soldPercentage;

  return (
    <div className={classes.root}>
      {tokenContract && (
        <>
          <div className={classes.title}>DRaju ICO</div>
          <div className={classes.address}>{tokenContract._address}</div>
          <div className={classes.transactionContainer}>
            <BuyToken buyTokenCallback={buyTokenCallback} />
            <>
              <div className={classes.coinsRemaining}>
                Tokens remaining {tokensRemaining}
              </div>
              <div className={classes.prograssionContainer}>
                <div
                  className={classes.progression}
                  style={{ width: `${soldPercentage}%` }}
                ></div>
              </div>
            </>
            <CoinStats tokensRemaining={tokensRemaining} />
          </div>
        </>
      )}

      {accounts[0] && (
        <div className={classes.text}>Your account: {accounts[0]}</div>
      )}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100vh",
    // justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  address: {
    fontSize: "150%",
    marginBottom: "3%",
  },
  text: {
    fontWeight: "bold",
    fontSize: "120%",
  },
  buy: {
    height: "100%",
  },
  title: {
    fontSize: "350%",
    fontWeight: "bold",
    marginTop: "4%",
    marginBottom: "1%",
  },
  coinsRemaining: {
    fontSize: "150%",
    fontWeight: "bold",
    marginBottom: "3%",
  },
  prograssionContainer: {
    width: "100%",
    height: "40px",
    border: "2px solid black",
    display: "border-box",
  },
  progression: {
    height: "100%",
    backgroundColor: "green",
  },
  transactionContainer: {
    width: "40%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    marginBottom: "5%",
  },
}));

interface tokenAttributes {
  name: string;
  symbol: string;
  totalSupply: number;
  tokenPrice: number;
}

export default App;
