var Cow = artifacts.require("./Cow.sol");
const CowTokenSale = artifacts.require("./CowTokenSale.sol");

module.exports = async (deployer) => {
  await deployer.deploy(Cow, 100000);
  const cowInstance = await Cow.deployed();
  await deployer.deploy(CowTokenSale, cowInstance.address, 1000000000000000);

  //Send 75% of tokens from contract to ICO
  const ICOInstance = await CowTokenSale.deployed();
  const reciept = await cowInstance.transfer(ICOInstance.address, 75000);
  console.log(reciept);
};
