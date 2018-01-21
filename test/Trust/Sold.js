const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('Trust', (accounts) => {
    describe('sold()', () => {
        it('verifies that only trustee can initiate sold', async () => {
            let contract = await Trust.new('Test Trust', 'Test Property', accounts[0], {from: accounts[9]});

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
