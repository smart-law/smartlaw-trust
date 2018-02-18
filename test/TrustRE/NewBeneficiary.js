const TrustRE = artifacts.require('TrustRE');
const EntityFactory = artifacts.require('EntityFactory');
const TrusteeFactory = artifacts.require('TrusteeFactory');
const DexRE = artifacts.require('DexRE');
const utils = require('../Utils');

contract('TrustRE', (accounts) => {
    describe('newBeneficiary()', () => {
        it('verifies that only existing trust beneficiary can add new beneficiary', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[1]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[0]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);

            try {
                await trustContract.newBeneficiary(accounts[9], {from: accounts[2]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that only existing entity can be added as trust beneficiary', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[1]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[0]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);

            let beneficiaryEntity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[2]});
            try {
                await trustContract.newBeneficiary(accounts[2], {from: accounts[1]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('should add new beneficiary', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[1]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[0]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);

            let beneficiaryEntity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[2]});
            await trustContract.newBeneficiary(beneficiaryEntity.logs[0].args.entity, {from: accounts[1]});

            let isBeneficiary = await trustContract.isBeneficiary.call(entity.logs[0].args.entity);
            assert.equal(isBeneficiary, true);
            isBeneficiary = await trustContract.isBeneficiary.call(beneficiaryEntity.logs[0].args.entity);
            assert.equal(isBeneficiary, true);
            let beneficiaries = await trustContract.beneficiariesSignatures.call();
            assert.equal(beneficiaries.length, 2);
        });

        it('verifies that new beneficiary fires a BeneficiaryAdded event', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[1]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[0]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);

            let beneficiaryEntity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[2]});
            let res = await trustContract.newBeneficiary(beneficiaryEntity.logs[0].args.entity, {from: accounts[1]});
            assert(res.logs.length > 0 && res.logs[0].event == 'BeneficiaryAdded');
        });

        it('should add new pending beneficiary', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[1]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[0]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);

            let beneficiaryEntity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[2]});
            await trustContract.newBeneficiary(beneficiaryEntity.logs[0].args.entity, {from: accounts[1]});

            let isBeneficiary = await trustContract.isBeneficiary.call(entity.logs[0].args.entity);
            assert.equal(isBeneficiary, true);
            isBeneficiary = await trustContract.isBeneficiary.call(beneficiaryEntity.logs[0].args.entity);
            assert.equal(isBeneficiary, true);
            let beneficiaries = await trustContract.beneficiariesSignatures.call();
            assert.equal(beneficiaries.length, 2);

            let newBeneficiaryEntity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            await trustContract.newBeneficiary(newBeneficiaryEntity.logs[0].args.entity, {from: accounts[1]});
            beneficiaries = await trustContract.beneficiariesSignatures.call();
            assert.equal(beneficiaries.length, 2);
            let pendingBeneficiaries = await trustContract.getPendingBeneficiaries.call();
            assert.equal(pendingBeneficiaries.length, 1);
        });

        it('verifies that new beneficiary fires a PendingBeneficiaryAdded event', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[1]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[0]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);

            let beneficiaryEntity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[2]});
            await trustContract.newBeneficiary(beneficiaryEntity.logs[0].args.entity, {from: accounts[1]});

            let newBeneficiaryEntity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let res = await trustContract.newBeneficiary(newBeneficiaryEntity.logs[0].args.entity, {from: accounts[2]});
            assert(res.logs.length > 0 && res.logs[0].event == 'PendingBeneficiaryAdded');
        });

    });
});
