var Migrations = artifacts.require("./Migrations.sol");
var SmartDeed = artifacts.require("./SmartDeed.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(SmartDeed);
};
