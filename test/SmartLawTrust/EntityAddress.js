const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('SmartLawTrust', (accounts) => {
    describe('entityAddress()', () => {
        it('verifies that an address has empty entity address', async () => {
            let contract = await SmartLawTrust.new();
            let res = await contract.entityAddress(accounts[1]);
            assert.equal(res, utils.zeroAddress);
        });

        it('verifies that an address has an entity address', async () => {
            let contract = await SmartLawTrust.new();
            let entity = await contract.newEntity(1, true, {from: accounts[1]});
            let res = await contract.entityAddress(accounts[1]);
            assert.equal(res, entity.logs[0].args.entity);
        });
    });
});
