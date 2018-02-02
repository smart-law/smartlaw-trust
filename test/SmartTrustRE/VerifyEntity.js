const EntityFactory = artifacts.require('./EntityFactory.sol');
const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('SmartTrustRE', (accounts) => {
    describe('verifyEntity()', () => {
        it('verifies that only the owner can verify entity', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address);
            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[1]});
            try {
                await contract.verifyEntity(entity.logs[0].args.entity, {from: accounts[9]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that only the active contract can verify entity', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address);
            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[1]});
            await contract.updateStatus(false);
            try {
                await contract.verifyEntity(entity.logs[0].args.entity);
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that entity was verified', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address);
            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[1]});
            let entityContract = await Entity.at(entity.logs[0].args.entity);
            let verified = await entityContract.verified.call();
            assert.equal(verified, false);
            await contract.verifyEntity(entity.logs[0].args.entity);
            verified = await entityContract.verified.call();
            assert.equal(verified, true);
        });
    });
});
