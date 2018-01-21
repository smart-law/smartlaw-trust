const UtilsLib = artifacts.require("./UtilsLib.sol");
const Owned = artifacts.require("./Owned.sol");
const UnderTrust = artifacts.require("./UnderTrust.sol");
const Trusteed = artifacts.require("./Trusteed.sol");
const Beneficiary = artifacts.require("./Beneficiary.sol");
const Sale = artifacts.require("./Sale.sol");
const Entity = artifacts.require("./Entity.sol");
const Trust = artifacts.require("./Trust.sol");
const SmartLawTrust = artifacts.require("./SmartLawTrust.sol");

module.exports = async (deployer) => {
  await deployer.deploy(UtilsLib);
  //deployer.link(UtilsLib, Sale);
  //deployer.link(UtilsLib, Beneficiary);
  //deployer.link(UtilsLib, UnderTrust);
  //deployer.link(UtilsLib, Trust);
  deployer.link(UtilsLib, SmartLawTrust);
  //deployer.deploy(Trusteed);
  //deployer.deploy(UnderTrust);
  //deployer.deploy(Owned);
  //deployer.deploy(Beneficiary);
  //deployer.deploy(Sale);
  //deployer.deploy(Entity);
  //deployer.deploy(Trust);
  deployer.deploy(SmartLawTrust);
};
