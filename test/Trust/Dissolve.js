const Trust = artifacts.require('./Trust.sol');
const EntityFactory = artifacts.require('./EntityFactory.sol');
const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const Sale = artifacts.require('./Sale.sol');
const utils = require('../helpers/Utils');

contract('Trust', (accounts) => {
    describe('dissolve()', () => {
        it('verifies that only existing trust beneficiary can sign dissolve trust', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await Trust.at(trust.logs[0].args.trust);
            try {
                await trustContract.dissolve({from: accounts[2]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that it adds signature to dissolve signatures list', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let entity2 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            let entity3 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[5]});
            let trustContract = await Trust.at(trust.logs[0].args.trust);
            await trustContract.newBeneficiary(entity2.logs[0].args.entity, {from: accounts[3]});
            let newBeneficiaryRes = await trustContract.newBeneficiary(entity3.logs[0].args.entity, {from: accounts[3]});
            await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[4]});

            await trustContract.dissolve({from: accounts[3]});
            let signatures = await trustContract.getDissolveSignatures.call();
            assert.equal(signatures.length, 1);
            await trustContract.dissolve({from: accounts[4]});
            signatures = await trustContract.getDissolveSignatures.call();
            assert.equal(signatures.length, 2);
        });

        it('verifies that it dissolve trust', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let entity2 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            let entity3 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[5]});
            let trustContract = await Trust.at(trust.logs[0].args.trust);
            await trustContract.newBeneficiary(entity2.logs[0].args.entity, {from: accounts[3]});
            let newBeneficiaryRes = await trustContract.newBeneficiary(entity3.logs[0].args.entity, {from: accounts[3]});
            await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[4]});

            await trustContract.dissolve({from: accounts[3]});
            let signatures = await trustContract.getDissolveSignatures.call();
            assert.equal(signatures.length, 1);
            await trustContract.dissolve({from: accounts[4]});
            signatures = await trustContract.getDissolveSignatures.call();
            assert.equal(signatures.length, 2);
            await trustContract.dissolve({from: accounts[5]});
            let dissolve = await trustContract.deleted.call();
            assert.equal(dissolve, true);
        });
    });
});
