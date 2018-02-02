const EntityFactory = artifacts.require('./EntityFactory.sol');
const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('EntityFactory', (accounts) => {
    describe('isEntityOwner()', () => {
        it('verifies that an address is not an entity owner', async () => {
            let contract = await EntityFactory.new();
            let res = await contract.isEntityOwner(accounts[1]);
            assert.equal(res, false);
        });

        it('verifies that an address is an entity owner', async () => {
            let contract = await EntityFactory.new();
            let smartLaw = await SmartLawTrust.new(contract.address);
            let entity = await contract.newEntity(smartLaw.address, 1, true, 'PH', {from: accounts[1]});
            let res = await contract.isEntityOwner(accounts[1]);
            assert.equal(res, true);
        });
    });
});
