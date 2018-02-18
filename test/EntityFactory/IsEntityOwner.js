const EntityFactory = artifacts.require('EntityFactory');
const DexRE = artifacts.require('DexRE');
const Entity = artifacts.require('Entity');
const utils = require('../Utils');

contract('EntityFactory', (accounts) => {
    describe('isEntityOwner()', () => {
        it('verifies that an address is not an entity owner', async () => {
            let contract = await EntityFactory.new();
            let res = await contract.isEntityOwner(accounts[1]);
            assert.equal(res, false);
        });

        it('verifies that an address is an entity owner', async () => {
            let contract = await EntityFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            let entity = await contract.newEntity(1, true, 'PH', {from: accounts[1]});
            let res = await contract.isEntityOwner(accounts[1]);
            assert.equal(res, true);
        });
    });
});
