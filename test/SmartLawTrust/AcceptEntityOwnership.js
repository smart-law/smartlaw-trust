const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('SmartLawTrust', (accounts) => {
    describe('acceptEntityOwnership()', () => {
        it('verifies that ownership acceptance is not initiated when entity address is not existing entity', async () => {
            let contract = await SmartLawTrust.new();
            let entity = await contract.newEntity(1, true, {from: accounts[1]});
            try {
                await contract.acceptEntityOwnership(accounts[1], {from: accounts[3]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that only active contract can initiate ownership acceptance', async () => {
            let contract = await SmartLawTrust.new();
            let entity = await contract.newEntity(1, true, {from: accounts[1]});
            await contract.updateStatus(false);
            try {
                await contract.acceptEntityOwnership(entity.logs[0].args.entity, {from: accounts[1]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies the new owner after ownership acceptance', async () => {
            let contract = await SmartLawTrust.new();
            let entity = await contract.newEntity(1, true, {from: accounts[1]});
            await contract.transferEntityOwnership(entity.logs[0].args.entity, accounts[2], {from: accounts[1]});
            await contract.acceptEntityOwnership(entity.logs[0].args.entity, {from: accounts[2]});
            let entityContract = await Entity.at(entity.logs[0].args.entity);
            let EntityOwner = await entityContract.owner.call();
            assert.equal(EntityOwner, accounts[2]);
            let res = await contract.isEntityOwner(accounts[2]);
            assert.equal(res, true);
            res = await contract.isEntityOwner(accounts[1]);
            assert.equal(res, false);
        });
    });
});
