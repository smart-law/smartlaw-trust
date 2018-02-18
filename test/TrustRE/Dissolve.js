const TrustRE = artifacts.require('TrustRE');
const EntityFactory = artifacts.require('EntityFactory');
const TrusteeFactory = artifacts.require('TrusteeFactory');
const DexRE = artifacts.require('DexRE');
const Sale = artifacts.require('Sale');
const utils = require('../Utils');

contract('TrustRE', (accounts) => {
    describe('dissolve()', () => {
        it('verifies that only existing trust beneficiary can sign dissolve trust', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
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
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let entity2 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            let entity3 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[5]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
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
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let entity2 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            let entity3 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[5]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
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
