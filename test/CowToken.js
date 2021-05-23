const Cow = artifacts.require("./Cow.sol");

contract("Cow", async (accounts) => {
  it("Initialises with correct name.", async () => {
    const tokenInstance = await Cow.deployed();

    const name = await tokenInstance.name();
    assert.equal(name, "Cow", "The token name was not Cow.");
  });

  it("token supply should be 100000.", async () => {
    const tokenInstance = await Cow.deployed();
    const tokenSupply = await tokenInstance.totalSupply();
    assert.equal(tokenSupply, 100000, "The total supply was not 100000.");
  });

  it("initialises with correct symbol", async () => {
    const tokenInstance = await Cow.deployed();
    const symbol = await tokenInstance.symbol();
    assert.equal(symbol, "MOO", "Symbol was not MOO");
  });

  it("admin account recieves all token supply", async () => {
    const tokenInstance = await Cow.deployed();
    const adminBalance = await tokenInstance.balanceOf(accounts[0]);
    assert.equal(adminBalance, 100000, "Admin balance is not token supply");
  });

  it("Stops on buffer overflow transactions", async () => {
    const tokenInstance = await Cow.deployed();
    try {
      await tokenInstance.transfer.call(accounts[1], 99999999999999999999999, {
        from: accounts[0],
      });
    } catch (e) {
      assert(e.message.indexOf("overflow") >= 0);
      return true;
    }
    throw new Error("I should never see this!");
  });

  it("Fails on transcations with insufficient balance", async () => {
    const tokenInstance = await Cow.deployed();
    try {
      await tokenInstance.transfer.call(accounts[0], 1, {
        from: accounts[1],
      });
    } catch (e) {
      assert(e.message.indexOf("revert") >= 0);
      return true;
    }
    throw new Error("I should never see this!");
  });

  it("Successfully makes transactions", async () => {
    const tokenInstance = await Cow.deployed();

    //Sending transaction
    const passedTransaction = await tokenInstance.transfer.call(
      accounts[1],
      50000,
      {
        from: accounts[0],
      }
    );
    assert(passedTransaction, true, "Transaction failed");

    //Check Transfer Event Logs
    //NOTE: Not adding .call to transfer means it wont actually call a transaction, will only inspect
    //the return value of the function
    const reciept = await tokenInstance.transfer(accounts[1], 50000, {
      from: accounts[0],
    });
    const firstLog = reciept.logs[0];
    assert(reciept.logs.length, 1);
    assert(firstLog.event, "Transfer");
    assert(firstLog.args._from, accounts[0]);
    assert(firstLog.args._to, accounts[1]);
    assert(firstLog.args._value, 50000);

    //Verify balance of sender and recipient correct
    const newBalanceSender = await tokenInstance.balanceOf(accounts[0]);
    assert.equal(
      newBalanceSender.toNumber(),
      50000,
      "transaction did not leave correct balance"
    );

    const newBalanceRecipient = await tokenInstance.balanceOf(accounts[1]);
    assert.equal(
      newBalanceRecipient.toNumber(),
      50000,
      "transaction did not leave correct balance"
    );
  });

  it("Can setup allowance", async () => {
    const tokenInstance = await Cow.deployed();
    const allowancelResponse = await tokenInstance.approve.call(
      accounts[1],
      50000,
      {
        from: accounts[0],
      }
    );
    assert.equal(allowancelResponse, true, "Failed to setup allowance");

    const allowanceTransaction = await tokenInstance.approve(
      accounts[1],
      50000,
      {
        from: accounts[0],
      }
    );

    const firstAllowance = allowanceTransaction.logs[0];

    assert.equal(firstAllowance.event, "Approval");
    assert.equal(firstAllowance.args._owner, accounts[0]);
    assert.equal(firstAllowance.args._spender, accounts[1]);
    assert.equal(firstAllowance.args._value, 50000);

    //Check allowance
    const allowance = await tokenInstance.allowance(accounts[0], accounts[1]);
    assert.equal(allowance, 50000);
  });

  it("Failing to transferFrom more than parent address's balance", async () => {
    try {
      const allowanceProvider = accounts[0];
      const allowanceTarget = accounts[1];
      const spender = accounts[2];

      //Set allowance large than balance
      const tokenInstance = await Cow.deployed();
      const allowancelResponse = await tokenInstance.approve.call(
        allowanceTarget,
        500000,
        {
          from: allowanceProvider,
        }
      );
      assert.equal(allowancelResponse, true, "allowance failed");

      //Withdraw more than parent address from allowance
      const withdraw = await tokenInstance.transferFrom(
        allowanceProvider,
        spender,
        500000,
        { from: allowanceTarget }
      );
    } catch (error) {
      console.log(error.message);
      assert(error.message.indexOf("revert") >= 0);
      return true;
    }
    throw new Error("I should never see this!");
  });

  it("Failing to withdraw more than allowance amount", async () => {
    const allowanceProvider = accounts[0];
    const allowanceTarget = accounts[1];
    const spender = accounts[2];
    try {
      //Set allowance large than balance
      const tokenInstance = await Cow.deployed();
      const allowancelResponse = await tokenInstance.approve.call(
        allowanceTarget,
        1000,
        {
          from: allowanceProvider,
        }
      );
      assert.equal(allowancelResponse, true, "allowance failed");

      //Withdraw more than allowance
      const withdraw = await tokenInstance.transferFrom(
        allowanceProvider,
        spender,
        90000,
        { from: allowanceTarget }
      );
    } catch (error) {
      assert(error.message.indexOf("revert") >= 0);
      return true;
    }
    throw new Error("I should never see this!");
  });

  it("Successfully transfering from allowance to 3rd party address", async () => {
    const allowanceProvider = accounts[0];
    const allowanceTarget = accounts[1];
    const spender = accounts[2];

    //Set allowance of 1000 for allowanceTarget
    const tokenInstance = await Cow.deployed();
    const allowancelResponse = await tokenInstance.approve(
      allowanceTarget,
      1000,
      {
        from: allowanceProvider,
      }
    );

    //Verify spender initially had 0 balance
    const spenderBalanceBefore = await tokenInstance.balanceOf(spender);
    assert.equal(spenderBalanceBefore, 0, "Spender already had Moo coins");

    //Transfer from allowanceTarget to spender
    const withdraw = await tokenInstance.transferFrom(
      allowanceProvider,
      spender,
      1000,
      { from: allowanceTarget }
    );

    //Check allowance of sender
    const spenderBalance = await tokenInstance.balanceOf(spender);
    assert.equal(
      spenderBalance.toNumber(),
      1000,
      "Spender did not recieve their 1000 tokens from transferFrom"
    );

    //Check if allowance was reduced
    const allowanceRemaining = await tokenInstance.allowance(
      allowanceProvider,
      allowanceTarget
    );
    assert.equal(
      allowanceRemaining.toNumber(),
      0,
      "Allowance remaining is not zero"
    );

    //Check if the allowance providers balance has been reduced
    const allowanceProviderBalance = await tokenInstance.balanceOf(
      allowanceProvider
    );

    assert.equal(allowanceProviderBalance.toNumber(), 49000);
  });
});
