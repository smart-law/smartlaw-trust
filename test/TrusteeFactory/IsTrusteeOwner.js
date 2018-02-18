const TrusteeFactory = artifacts.require('TrusteeFactory');
const DexRE = artifacts.require('DexRE');
const Tru = artifacts.require('Trustee');
const utils = require('../Utils');

contract('TrusteeFactory', (accounts) => {
    describe('isTrusteeOwner()', () => {
        it('verifies that an address is not a trustee owner', async () => {
            let contract = await TrusteeFactory.new();
            let res = await contract.isTrusteeOwner(accounts[1]);
            assert.equal(res, false);
        });

        it('verifies that an address is a trustee owner', async () => {
            let contract = await TrusteeFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            await contract.newTrustee('Test Trustee', {from: accounts[1]});
            let res = await contract.isTrusteeOwner(accounts[1]);
            assert.equal(res, true);
        });
    });
});
