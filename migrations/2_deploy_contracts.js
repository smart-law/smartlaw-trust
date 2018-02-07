// const UtilsLib = artifacts.require("./UtilsLib.sol");
// const SmartTrustRE = artifacts.require("./SmartTrustRE.sol");
// const EntityFactory = artifacts.require("./EntityFactory.sol");
//
// module.exports = async (deployer) => {
//   await deployer.deploy(UtilsLib);
//   await deployer.link(UtilsLib, SmartTrustRE);
//   await deployer.deploy(EntityFactory);
//   await deployer.deploy(SmartTrustRE, EntityFactory.address);
// };


const UtilsLib = artifacts.require("./UtilsLib.sol");
const Owned = artifacts.require("./Owned.sol");
const Signable = artifacts.require("./Signable.sol");
const Trusteed = artifacts.require("./Trusteed.sol");
const Beneficiary = artifacts.require("./Beneficiary.sol");
const Loan = artifacts.require("./Loan.sol");
const Sale = artifacts.require("./Sale.sol");
const Entity = artifacts.require("./Entity.sol");
const Trust = artifacts.require("./Trust.sol");
const LoanableTrust = artifacts.require("./LoanableTrust.sol");
const SalableTrust = artifacts.require("./SalableTrust.sol");
const TrustRE = artifacts.require("./TrustRE.sol");
const SmartTrustRE = artifacts.require("./SmartTrustRE.sol");
const EntityFactory = artifacts.require("./EntityFactory.sol");

module.exports = async (deployer) => {
  await deployer.deploy(UtilsLib);
  await deployer.link(UtilsLib, Sale);
  await deployer.link(UtilsLib, Loan);
  await deployer.link(UtilsLib, Beneficiary);
  await deployer.link(UtilsLib, Signable);
  await deployer.link(UtilsLib, LoanableTrust);
  await deployer.link(UtilsLib, SalableTrust);
  await deployer.link(UtilsLib, TrustRE);
  await deployer.link(UtilsLib, SmartTrustRE);
  await deployer.deploy(Trusteed, '0x0');
  await deployer.deploy(Signable, '0x0');
  await deployer.deploy(Owned, '0x0');
  await deployer.deploy(Beneficiary, '0x0', '0x0', '0x0');
  await deployer.deploy(Sale, '0x0', 0, '0x0');
  await deployer.deploy(Loan, '0x0', 0, 0, 0, '0x0');
  await deployer.deploy(Entity, '0x0', '0x0', 0, false, '0x0');
  await deployer.deploy(Trust);
  await deployer.deploy(LoanableTrust);
  await deployer.deploy(SalableTrust);
  await deployer.deploy(TrustRE, '0x0', '0x0', '0x0');
  await deployer.deploy(EntityFactory);
  await deployer.deploy(SmartTrustRE, EntityFactory.address);
};
