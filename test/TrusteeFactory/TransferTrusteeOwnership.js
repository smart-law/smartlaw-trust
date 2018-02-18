const TrusteeFactory = artifacts.require('TrusteeFactory');
const DexRE = artifacts.require('DexRE');
const Trustee = artifacts.require('Trustee');
const utils = require('../Utils');

contract('TrusteeFactory', (accounts) => {
    describe('transferTrusteeOwnership()', () => {
        it('verifies that ownership transfer is not initiated when trustee address is not existing trustee', async () => {
            let contract = await TrusteeFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            let trustee = await contract.newTrustee('Test Trustee', {from: accounts[1]});
            try {
                await contract.transferTrusteeOwnership(accounts[3], accounts[2], {from: accounts[1]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies the new owner after ownership transfer', async () => {
            let contract = await TrusteeFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            let trustee = await contract.newTrustee('Test Trustee', {from: accounts[1]});
            await contract.transferTrusteeOwnership(trustee.logs[0].args.trustee, accounts[2], {from: accounts[1]});
            let trusteeContract = await Trustee.at(trustee.logs[0].args.trustee);
            let TrusteeNewOwner = await trusteeContract.newOwner.call();
            assert.equal(TrusteeNewOwner, accounts[2]);
        });
    });
});
