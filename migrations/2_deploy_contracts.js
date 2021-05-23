var Cow = artifacts.require("./Cow.sol");

module.exports = function (deployer) {
  deployer.deploy(Cow, 100000);
};
