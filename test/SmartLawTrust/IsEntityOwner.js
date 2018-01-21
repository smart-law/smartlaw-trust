const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('SmartLawTrust', (accounts) => {
    describe('isEntityOwner()', () => {
        it('verifies that an address is not an entity owner', async () => {
            let contract = await SmartLawTrust.new();
            let res = await contract.isEntityOwner(accounts[1]);
            assert.equal(res, false);
        });

        it('verifies that an address is an entity owner', async () => {
            let contract = await SmartLawTrust.new();
            let entity = await contract.newEntity(1, true, {from: accounts[1]});
            let res = await contract.isEntityOwner(accounts[1]);
            assert.equal(res, true);
        });
    });
});
