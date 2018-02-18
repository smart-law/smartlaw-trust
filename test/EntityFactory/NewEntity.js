const EntityFactory = artifacts.require('EntityFactory');
const DexRE = artifacts.require('DexRE');
const Entity = artifacts.require('Entity');
const utils = require('../Utils');

contract('EntityFactory', (accounts) => {
    describe('newEntity()', () => {
        it('verifies that new entity fires an EntityCreated event', async () => {
            let contract = await EntityFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            let res = await contract.newEntity(1, true, 'PH', {from: accounts[1]});
            assert(res.logs.length > 0 && res.logs[0].event == 'EntityCreated');
        });

        it('verifies that entity does not duplicate', async () => {
            let contract = await EntityFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            await contract.newEntity(1, true, 'PH', {from: accounts[1]});
            try {
                await contract.newEntity(1, true, 'PH', {from: accounts[1]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('should create new entity', async () => {
            let contract = await EntityFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            let entity = await contract.newEntity(1, true, 'PH', {from: accounts[1]});
            let entityContract = await Entity.at(entity.logs[0].args.entity);
            let EntityOwner = await entityContract.owner.call();
            assert.equal(EntityOwner, accounts[1]);
            let Factory = await entityContract.factory.call();
            assert.equal(Factory, contract.address);
            let dexREAdmin = await entityContract.DexREAdmin.call();
            assert.equal(dexREAdmin, dexRE.address);
        });
    });
});
