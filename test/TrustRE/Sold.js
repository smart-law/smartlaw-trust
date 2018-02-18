const TrustRE = artifacts.require('TrustRE');
const utils = require('../Utils');

contract('TrustRE', (accounts) => {
    describe('sold()', () => {
        it('verifies that only DexRE can initiate sold', async () => {
            let contract = await TrustRE.new(accounts[3], 'Test Trust', 'Test Property', accounts[0], {from: accounts[9]});

            try {
                await contract.sold(accounts[1], {from: accounts[2]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });
    });
});
