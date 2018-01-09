var Migrations = artifacts.require("./Migrations.sol");
var SmartLawTrust = artifacts.require("./SmartLawTrust.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(SmartLawTrust);
};
