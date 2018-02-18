const DexRE = artifacts.require('DexRE');
const utils = require('../Utils');

contract('DexRE', (accounts) => {
    describe('updateStatus()', () => {
        it('verifies that only owner can deactivate or activate contract', async () => {
            let contract = await DexRE.new('0x0', '0x0');
            try {
                await contract.updateStatus(true, {from: accounts[8]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies contract status after owner deactivate or activate contract', async () => {
            let contract = await DexRE.new('0x0', '0x0');
            await contract.updateStatus(false);
            let status = await contract.status.call();
            assert.equal(status, false);
            await contract.updateStatus(true);
            status = await contract.status.call();
            assert.equal(status, true);
        });
    });
});
