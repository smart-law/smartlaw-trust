const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const EntityFactory = artifacts.require('./EntityFactory.sol');
const Entity = artifacts.require('./Entity.sol');
const utils = require('../helpers/Utils');

contract('SmartTrustRE', (accounts) => {
    describe('updateStatus()', () => {
        it('verifies that only owner can deactivate or activate contract', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address);
            try {
                await contract.updateStatus(true, {from: accounts[8]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies contract status after owner deactivate or activate contract', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address);
            await contract.updateStatus(false);
            let status = await contract.status.call();
            assert.equal(status, false);
            await contract.updateStatus(true);
            status = await contract.status.call();
            assert.equal(status, true);
        });
    });
});
