const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const EntityFactory = artifacts.require('./EntityFactory.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('SmartLawTrust', (accounts) => {
    describe('SmartLawTrust()', () => {
        it('verifies the SmartLawTrust after construction', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartLawTrust.new(entityFactory.address);
            let owner = await contract.owner.call();
            assert.equal(owner, accounts[0]);
            let status = await contract.status.call();
            assert.equal(status, true);
        });
    });
});
