var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Todo = artifacts.require("./TodoList.sol");

module.exports = function (deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Todo);
};
