const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('SmartLawTrust', (accounts) => {
    describe('updateStatus()', () => {
        it('verifies that only owner can deactivate or activate contract', async () => {
            let contract = await SmartLawTrust.new();
            try {
                await contract.updateStatus(true, {from: accounts[8]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies contract status after owner deactivate or activate contract', async () => {
            let contract = await SmartLawTrust.new();
            await contract.updateStatus(false);
            let status = await contract.status.call();
            assert.equal(status, false);
            await contract.updateStatus(true);
            status = await contract.status.call();
            assert.equal(status, true);
        });
    });
});
