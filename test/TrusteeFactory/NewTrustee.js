const TrusteeFactory = artifacts.require('TrusteeFactory');
const DexRE = artifacts.require('DexRE');
const Trustee = artifacts.require('Trustee');
const utils = require('../Utils');

contract('TrusteeFactory', (accounts) => {
    describe('newTrustee()', () => {
        it('verifies that new trustee fires an TrusteeCreated event', async () => {
            let contract = await TrusteeFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            let res = await contract.newTrustee('Test Trustee', {from: accounts[1]});
            assert(res.logs.length > 0 && res.logs[0].event == 'TrusteeCreated');
        });

        it('verifies that trustee does not duplicate', async () => {
            let contract = await TrusteeFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            await contract.newTrustee('Test Trustee', {from: accounts[1]});
            try {
                await contract.newTrustee('Test Trustee', {from: accounts[1]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('should create new trustee', async () => {
            let contract = await TrusteeFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            let trustee = await contract.newTrustee('Test Trustee', {from: accounts[1]});
            let trusteeContract = await Trustee.at(trustee.logs[0].args.trustee);
            let TrusteeOwner = await trusteeContract.owner.call();
            assert.equal(TrusteeOwner, accounts[1]);
            let Factory = await trusteeContract.factory.call();
            assert.equal(Factory, contract.address);
            let dexREAdmin = await trusteeContract.DexREAdmin.call();
            assert.equal(dexREAdmin, dexRE.address);
        });
    });
});
