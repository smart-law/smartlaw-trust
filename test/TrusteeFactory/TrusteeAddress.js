const TrusteeFactory = artifacts.require('TrusteeFactory');
const DexRE = artifacts.require('DexRE');
const Entity = artifacts.require('Entity');
const utils = require('../Utils');

contract('TrusteeFactory', (accounts) => {
    describe('trusteeAddress()', () => {
        it('verifies that an address has empty entity address', async () => {
            let contract = await TrusteeFactory.new();
            let res = await contract.trusteeAddress(accounts[1]);
            assert.equal(res, utils.zeroAddress);
        });

        it('verifies that an address has an entity address', async () => {
            let contract = await TrusteeFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            let trustee = await contract.newTrustee('Test Trustee', {from: accounts[1]});
            let res = await contract.trusteeAddress(accounts[1]);
            assert.equal(res, trustee.logs[0].args.trustee);
        });
    });
});
