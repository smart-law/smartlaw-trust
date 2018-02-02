const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const EntityFactory = artifacts.require('./EntityFactory.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('SmartTrustRE', (accounts) => {
    describe('SmartTrustRE()', () => {
        it('verifies the SmartTrustRE after construction', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address);
            let owner = await contract.owner.call();
            assert.equal(owner, accounts[0]);
            let status = await contract.status.call();
            assert.equal(status, true);
        });
    });
});
