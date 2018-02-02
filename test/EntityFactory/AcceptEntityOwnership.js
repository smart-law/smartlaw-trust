const EntityFactory = artifacts.require('./EntityFactory.sol');
const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('EntityFactory', (accounts) => {
    describe('acceptEntityOwnership()', () => {
        it('verifies that ownership acceptance is not initiated when entity address is not existing entity', async () => {
            let entityFactory = await EntityFactory.new();
            let smartTrustRE = await SmartTrustRE.new(entityFactory.address);
            let entity = await entityFactory.newEntity(smartTrustRE.address, 1, true, 'PH', {from: accounts[1]});
            try {
                await entityFactory.acceptEntityOwnership(accounts[1], {from: accounts[3]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies the new owner after ownership acceptance', async () => {
            let entityFactory = await EntityFactory.new();
            let smartTrustRE = await SmartTrustRE.new(entityFactory.address);
            let entity = await entityFactory.newEntity(smartTrustRE.address, 1, true, 'PH', {from: accounts[1]});
            await entityFactory.transferEntityOwnership(entity.logs[0].args.entity, accounts[2], {from: accounts[1]});
            await entityFactory.acceptEntityOwnership(entity.logs[0].args.entity, {from: accounts[2]});
            let entityContract = await Entity.at(entity.logs[0].args.entity);
            let EntityOwner = await entityContract.owner.call();
            assert.equal(EntityOwner, accounts[2]);
            let res = await entityFactory.isEntityOwner(accounts[2]);
            assert.equal(res, true);
            res = await entityFactory.isEntityOwner(accounts[1]);
            assert.equal(res, false);
        });
    });
});
