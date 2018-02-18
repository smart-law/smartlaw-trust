const EntityFactory = artifacts.require('EntityFactory');
const DexRE = artifacts.require('DexRE');
const Entity = artifacts.require('Entity');
const utils = require('../Utils');

contract('EntityFactory', (accounts) => {
    describe('transferEntityOwnership()', () => {
        it('verifies that ownership transfer is not initiated when entity address is not existing entity', async () => {
            let contract = await EntityFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            let entity = await contract.newEntity(1, true, 'PH', {from: accounts[1]});
            try {
                await contract.transferEntityOwnership(accounts[3], accounts[2], {from: accounts[1]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies the new owner after ownership transfer', async () => {
            let contract = await EntityFactory.new();
            let dexRE = await DexRE.new(contract.address, '0x0');
            await contract.setDexRE(dexRE.address);
            let entity = await contract.newEntity(1, true, 'PH', {from: accounts[1]});
            await contract.transferEntityOwnership(entity.logs[0].args.entity, accounts[2], {from: accounts[1]});
            let entityContract = await Entity.at(entity.logs[0].args.entity);
            let EntityNewOwner = await entityContract.newOwner.call();
            assert.equal(EntityNewOwner, accounts[2]);
        });
    });
});
