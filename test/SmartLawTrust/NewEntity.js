const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('SmartLawTrust', (accounts) => {
    describe('newEntity()', () => {
        it('verifies that new entity fires an EntityCreated event', async () => {
            let contract = await SmartLawTrust.new();
            let res = await contract.newEntity(1, true, {from: accounts[1]});
            assert(res.logs.length > 0 && res.logs[0].event == 'EntityCreated');
        });

        it('verifies that only active contract can create entity', async () => {
            let contract = await SmartLawTrust.new();
            await contract.updateStatus(false);
            try {
                await contract.newEntity(1, true, {from: accounts[1]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that entity does not duplicate', async () => {
            let contract = await SmartLawTrust.new();
            await contract.newEntity(1, true, {from: accounts[1]});
            try {
                await contract.newEntity(1, true, {from: accounts[1]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('should create new entity', async () => {
            let contract = await SmartLawTrust.new();
            let entity = await contract.newEntity(1, true, {from: accounts[1]});
            let entityContract = await Entity.at(entity.logs[0].args.entity);
            let EntityOwner = await entityContract.owner.call();
            assert.equal(EntityOwner, accounts[1]);
            let EntityTrustee = await entityContract.trustee.call();
            assert.equal(EntityTrustee, contract.address);
        });
    });
});
