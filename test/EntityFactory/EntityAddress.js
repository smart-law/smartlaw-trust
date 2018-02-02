const EntityFactory = artifacts.require('./EntityFactory.sol');
const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('EntityFactory', (accounts) => {
    describe('entityAddress()', () => {
        it('verifies that an address has empty entity address', async () => {
            let contract = await EntityFactory.new();
            let res = await contract.entityAddress(accounts[1]);
            assert.equal(res, utils.zeroAddress);
        });

        it('verifies that an address has an entity address', async () => {
            let contract = await EntityFactory.new();
            let smartTrustRE = await SmartTrustRE.new(contract.address);
            let entity = await contract.newEntity(smartTrustRE.address, 1, true, 'PH', {from: accounts[1]});
            let res = await contract.entityAddress(accounts[1]);
            assert.equal(res, entity.logs[0].args.entity);
        });
    });
});
