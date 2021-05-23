const SimpleStorage = artifacts.require("./SimpleStorage.sol");
const Todo = artifacts.require("./TodoList.sol");
var Cow = artifacts.require("./Cow.sol");

module.exports = function (deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Todo);
  // deployer.deploy(Cow);
};
