const UtilsLib = artifacts.require("./UtilsLib.sol");
const Trusteed = artifacts.require("./Trusteed.sol");
const User = artifacts.require("./User.sol");
const Trustee = artifacts.require("./Trustee.sol");
const Entity = artifacts.require("./Entity.sol");
const EntityFactory = artifacts.require("./EntityFactory.sol");
const TrusteeFactory = artifacts.require("./TrusteeFactory.sol");
const DexRE = artifacts.require("./DexRE.sol");

const Bid = artifacts.require("./Bid.sol");
const Signable = artifacts.require("./Signable.sol");
const Sale = artifacts.require("./Sale.sol");
const Loan = artifacts.require("./Loan.sol");
const Beneficiary = artifacts.require("./Beneficiary.sol");
const TrustRE = artifacts.require("./TrustRE.sol");

module.exports = async (deployer) => {
    await deployer.deploy(UtilsLib);
    await deployer.link(UtilsLib, Signable);
    await deployer.link(UtilsLib, Sale);
    await deployer.link(UtilsLib, Loan);
    await deployer.link(UtilsLib, Beneficiary);
    await deployer.link(UtilsLib, TrustRE);
    await deployer.link(UtilsLib, DexRE);
    await deployer.deploy(Signable, '0x0');
    await deployer.deploy(Bid, '0x0', 0);
    await deployer.deploy(Sale, '0x0', 0, '0x0');
    await deployer.deploy(Loan, '0x0', 0, 0, 0, '0x0');
    await deployer.deploy(Beneficiary, '0x0', '0x0', '0x0');
    await deployer.deploy(Trusteed, '0x0');
    await deployer.deploy(User, '0x0', '0x0', '0x0', '0x0');
    await deployer.deploy(Entity, '0x0', '0x0', '0x0', 1, false, '');
    await deployer.deploy(Trustee, '0x0', '0x0', '0x0', '');
    await deployer.deploy(TrustRE, '0x0', '0x0', '0x0');
    await deployer.deploy(TrusteeFactory);
    await deployer.deploy(EntityFactory);
    await deployer.deploy(DexRE, EntityFactory.address, TrusteeFactory.address);
};
