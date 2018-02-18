const EntityFactory = artifacts.require('EntityFactory');
const DexRE = artifacts.require('DexRE');
const Entity = artifacts.require('Entity');
const utils = require('../Utils');

contract('EntityFactory', (accounts) => {
    describe('entityAddress()', () => {
        it('verifies that an address has empty entity address', async () => {
            let contract = await EntityFactory.new();
            let res = await contract.entityAddress(accounts[1]);
            assert.equal(res, utils.zeroAddress);
        });

        it('verifies that an address has an entity address', async () => {
            let contract = await EntityFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            let entity = await contract.newEntity(1, true, 'PH', {from: accounts[1]});
            let res = await contract.entityAddress(accounts[1]);
            assert.equal(res, entity.logs[0].args.entity);
        });
    });
});
