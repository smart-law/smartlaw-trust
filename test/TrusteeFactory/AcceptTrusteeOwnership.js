const TrusteeFactory = artifacts.require('TrusteeFactory');
const DexRE = artifacts.require('DexRE');
const Trustee = artifacts.require('Trustee');
const utils = require('../Utils');

contract('TrusteeFactory', (accounts) => {
    describe('acceptTrusteeOwnership()', () => {
        it('verifies that ownership acceptance is not initiated when trustee address is not existing trustee', async () => {
            let trusteeFactory = await TrusteeFactory.new();
            let dexRE = await DexRE.new(trusteeFactory.address, '0x0');
            await trusteeFactory.setDexRE(dexRE.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[1]});
            try {
                await trusteeFactory.acceptTrusteeOwnership(accounts[1], {from: accounts[3]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies the new owner after ownership acceptance', async () => {
            let trusteeFactory = await TrusteeFactory.new();
            let dexRE = await DexRE.new(trusteeFactory.address, '0x0');
            await trusteeFactory.setDexRE(dexRE.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[1]});
            await trusteeFactory.transferTrusteeOwnership(trustee.logs[0].args.trustee, accounts[2], {from: accounts[1]});
            await trusteeFactory.acceptTrusteeOwnership(trustee.logs[0].args.trustee, {from: accounts[2]});
            let trusteeContract = await Trustee.at(trustee.logs[0].args.trustee);
            let TrusteeOwner = await trusteeContract.owner.call();
            assert.equal(TrusteeOwner, accounts[2]);
            let res = await trusteeFactory.isTrusteeOwner(accounts[2]);
            assert.equal(res, true);
            res = await trusteeFactory.isTrusteeOwner(accounts[1]);
            assert.equal(res, false);
        });
    });
});
