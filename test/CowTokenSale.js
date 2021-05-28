const CowTokenSale = artifacts.require("./CowTokenSale.sol");
const Cow = artifacts.require("./Cow.sol");

contract("CowTokenSale", (accounts) => {
  const tokenPrice = 1000000000000000; //in wei
  const buyer = accounts[0];
  const numberOfTokens = 10;

  it("Initialises the contract with correct values", async () => {
    const tokenSaleInstance = await CowTokenSale.deployed();
    //Has a contract address
    const address = tokenSaleInstance.address;
    assert.notEqual(address, 0x0, "has contract address");

    //Has token contract address
    const tokenContractAddress = await tokenSaleInstance.tokenContract();
    assert.notEqual(tokenContractAddress, 0x0, "has token contract address");

    //Check token price
    const tokenPriceRes = await tokenSaleInstance.tokenPrice();
    assert.equal(tokenPriceRes, tokenPrice, "Token price not set");
  });

  it("Can buy tokens", async () => {
    const tokenSaleInstance = await CowTokenSale.deployed();
    const tokenInstance = await Cow.deployed();

    //Send all token supply from token instance to token sale
    const tokenSaleInstanceAddress = await tokenSaleInstance.address;
    const log = await tokenInstance.transfer(tokenSaleInstanceAddress, 75000, {
      from: accounts[0],
    });

    //Check balance of tokenSaleContract
    const tokenSaleBalance = await tokenInstance.balanceOf(
      tokenSaleInstanceAddress
    );

    assert.equal(
      tokenSaleBalance,
      75000,
      "Token supply was not transfered to tokenSale contract"
    );

    //Buy tokens
    const reciept = await tokenSaleInstance.buyTokens(numberOfTokens, {
      from: accounts[5],
      value: tokenPrice * numberOfTokens,
    });

    //Verify event logs are correct for token buy
    const tokenBuyReciept = reciept.logs[0];

    assert.equal(tokenBuyReciept.event, "Buy", "Tokens were not bought");
    assert.equal(
      tokenBuyReciept.args.buyer,
      accounts[5],
      `Token buyer was not ${accounts[5]}`
    );
    assert.equal(
      tokenBuyReciept.args.numberOfTokens,
      numberOfTokens,
      `Number of tokens bought was not ${numberOfTokens}`
    );

    //Verify tokens sold
    const tokensSold = await tokenSaleInstance.tokensSold();
    assert.equal(tokensSold.toNumber(), 10);

    //Verify token buyer has correct balance
    const buyerBalance = await tokenInstance.balanceOf(accounts[5]);
    assert.equal(
      buyerBalance,
      10,
      "Correct token amount was not transferred to buyer"
    );
  });

  it("Fails to buy more tokens than available by token sale contract", async () => {
    try {
      const tokenSaleInstance = await CowTokenSale.deployed();
      const tokenInstance = await Cow.deployed();

      //Token ownership was transferred to tokenSale contract in previous test

      const tokenSaleContractAddress = await tokenSaleInstance.address;
      const saleBalance = await tokenInstance.balanceOf(
        tokenSaleContractAddress
      );

      const balance = await saleBalance.toNumber();

      //Buy more tokens than available
      const reciept = await tokenSaleInstance.buyTokens(75001, {
        from: accounts[2],
        value: tokenPrice * 75001,
      });
    } catch (error) {
      assert(error.message.indexOf("revert") >= 0);
      return true;
    }
    throw new Error("Should not reach this");
  });

  it("Must fail is attempting to buy tokens with insuffient value from buyer", async () => {
    try {
      const tokenSaleInstance = await CowTokenSale.deployed();
      //Buy tokens
      const reciept = await tokenSaleInstance.buyTokens(numberOfTokens, {
        from: buyer,
        value: 10,
      });
    } catch (error) {
      assert(error.message.indexOf("revert") >= 0);
      return true;
    }
    throw new Error("Should not reach this");
  });

  it("Can end token sale and remaining balance is sent to token contract", async () => {
    const tokenSaleInstance = await CowTokenSale.deployed();
    const tokenInstance = await Cow.deployed();

    //Check balance remaining
    let tokensRemainingInSale = await tokenInstance.balanceOf(
      tokenSaleInstance.address
    );
    tokensRemainingInSale = parseInt(tokensRemainingInSale, 10);

    let tokensInitiallyInTokenContract = await tokenInstance.balanceOf(
      accounts[0]
    );
    tokensInitiallyInTokenContract = parseInt(
      tokensInitiallyInTokenContract,
      10
    );

    //End sale
    await tokenSaleInstance.endSale({ from: accounts[0] });

    let finalTokenContractBalance = await tokenInstance.balanceOf(accounts[0]);
    finalTokenContractBalance = parseInt(finalTokenContractBalance, 10);

    const totalExpected =
      parseInt(tokensInitiallyInTokenContract, 10) +
      parseInt(tokensRemainingInSale, 10);

    assert.equal(
      totalExpected,
      finalTokenContractBalance,
      "All tokens were not returned to token contract at end of sale"
    );
  });
});
