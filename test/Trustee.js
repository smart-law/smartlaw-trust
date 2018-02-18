const Trustee = artifacts.require('Trustee');
const utils = require('./Utils');

contract('Trustee', (accounts) => {

    describe('Trustee()', () => {
        it('verifies the trustee after construction', async () => {
            let contract = await Trustee.new(
                accounts[0], // dexRE
                accounts[1], // liquidRE
                accounts[2], // owner
                'Test Trustee' // name
            );
            let name = await contract.name.call();
            assert.equal(name, 'Test Trustee');
        });
    });

    describe('addTrust()', () => {
        it('verifies that only admin can add trust', async () => {
            let contract = await Trustee.new(
                accounts[0], // dexRE
                accounts[1], // liquidRE
                accounts[2], // owner
                'Test Trustee' // name
            );
            try {
                await contract.addTrust(accounts[9], {from: accounts[5]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that trust was added', async () => {
            let contract = await Trustee.new(
                accounts[0], // dexRE
                accounts[1], // liquidRE
                accounts[2], // owner
                'Test Trustee' // name
            );
            await contract.addTrust(accounts[9], {from: accounts[0]});
            let trusts = await contract.trustAddresses.call();
            assert.equal(trusts.length, 1);
        });

    });

});
