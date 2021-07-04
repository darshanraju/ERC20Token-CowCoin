var DRaju = artifacts.require("./DRaju.sol");
const DRajuTokenSale = artifacts.require("./DRajuTokenSale.sol");

module.exports = async (deployer) => {
  await deployer.deploy(DRaju, 100000);
  const DRajuInstance = await DRaju.deployed();
  await deployer.deploy(
    DRajuTokenSale,
    DRajuInstance.address,
    1000000000000000
  );

  //Send 75% of tokens from contract to ICO
  const ICOInstance = await DRajuTokenSale.deployed();
  const reciept = await DRajuInstance.transfer(ICOInstance.address, 75000);
  console.log(reciept);
};
