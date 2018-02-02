const UtilsLib = artifacts.require("./UtilsLib.sol");
const Owned = artifacts.require("./Owned.sol");
const UnderTrust = artifacts.require("./UnderTrust.sol");
const Trusteed = artifacts.require("./Trusteed.sol");
const Beneficiary = artifacts.require("./Beneficiary.sol");
const Sale = artifacts.require("./Sale.sol");
const Entity = artifacts.require("./Entity.sol");
const Trust = artifacts.require("./Trust.sol");
const SmartTrustRE = artifacts.require("./SmartTrustRE.sol");
const EntityFactory = artifacts.require("./EntityFactory.sol");

module.exports = async (deployer) => {
  await deployer.deploy(UtilsLib);
  await deployer.link(UtilsLib, Sale);
  await deployer.link(UtilsLib, Beneficiary);
  await deployer.link(UtilsLib, UnderTrust);
  await deployer.link(UtilsLib, Trust);
  await deployer.link(UtilsLib, SmartTrustRE);
  await deployer.deploy(Trusteed);
  await deployer.deploy(UnderTrust);
  await deployer.deploy(Owned);
  await deployer.deploy(Beneficiary);
  await deployer.deploy(Sale);
  await deployer.deploy(Entity);
  await deployer.deploy(Trust);
  await deployer.deploy(EntityFactory);
  await deployer.deploy(SmartTrustRE, EntityFactory.address);
};
