const EntityFactory = artifacts.require('./EntityFactory.sol');
const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('EntityFactory', (accounts) => {
    describe('newEntity()', () => {
        it('verifies that new entity fires an EntityCreated event', async () => {
            let contract = await EntityFactory.new();
            let smartLaw = await SmartLawTrust.new(contract.address);
            let res = await contract.newEntity(smartLaw.address, 1, true, 'PH', {from: accounts[1]});
            assert(res.logs.length > 0 && res.logs[0].event == 'EntityCreated');
        });

        it('verifies that entity does not duplicate', async () => {
            let contract = await EntityFactory.new();
            let smartLaw = await SmartLawTrust.new(contract.address);
            await contract.newEntity(smartLaw.address, 1, true, 'PH', {from: accounts[1]});
            try {
                await contract.newEntity(smartLaw.address, 1, true, 'PH', {from: accounts[1]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('should create new entity', async () => {
            let contract = await EntityFactory.new();
            let smartLaw = await SmartLawTrust.new(contract.address);
            let entity = await contract.newEntity(smartLaw.address, 1, true, 'PH', {from: accounts[1]});
            let entityContract = await Entity.at(entity.logs[0].args.entity);
            let EntityOwner = await entityContract.owner.call();
            assert.equal(EntityOwner, accounts[1]);
            let EntityTrustee = await entityContract.trustee.call();
            assert.equal(EntityTrustee, smartLaw.address);
            let Factory = await entityContract.factory.call();
            assert.equal(Factory, contract.address);
        });
    });
});
