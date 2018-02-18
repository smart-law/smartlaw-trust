const TrustRE = artifacts.require('TrustRE');
const TrusteeFactory = artifacts.require('TrusteeFactory');
const EntityFactory = artifacts.require('EntityFactory');
const DexRE = artifacts.require('DexRE');
const Beneficiary = artifacts.require('Beneficiary');
const utils = require('../Utils');

contract('Trust', (accounts) => {
    describe('agreeToAddBeneficiary()', () => {
      it('verifies that only existing trust beneficiary can sign to add new beneficiary', async () => {
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
          let entity2 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[2]});
          let entity3 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
          await trustContract.newBeneficiary(entity2.logs[0].args.entity, {from: accounts[1]});
          let newBeneficiaryRes = await trustContract.newBeneficiary(entity3.logs[0].args.entity, {from: accounts[1]});
          try {
              await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[8]});
              assert(false, "didn't throw");
          }
          catch (error) {
              return utils.ensureException(error);
          }
      });

      it('should add new signature to pending beneficiary', async () => {
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
          let entity2 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[2]});
          let entity3 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
          let entity4 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});

          await trustContract.newBeneficiary(entity2.logs[0].args.entity, {from: accounts[1]});
          let newBeneficiaryRes = await trustContract.newBeneficiary(entity3.logs[0].args.entity, {from: accounts[1]});
          let newBeneficiaryRes2 = await trustContract.newBeneficiary(entity4.logs[0].args.entity, {from: accounts[1]});
          await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[2]});

          let beneficiaryContract = await Beneficiary.at(newBeneficiaryRes2.logs[0].args.beneficiary);
          let signaturesCount = await beneficiaryContract.countSignatures.call();
          assert.equal(signaturesCount, 1);
          await trustContract.agreeToAddBeneficiary(newBeneficiaryRes2.logs[0].args.beneficiary, {from: accounts[2]});
          signaturesCount = await beneficiaryContract.countSignatures.call();
          assert.equal(signaturesCount, 2);
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
          let beneficiaries = await trustContract.beneficiariesSignatures.call();
          assert.equal(beneficiaries.length, 1);
          let entity2 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[2]});
          let entity3 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});

          await trustContract.newBeneficiary(entity2.logs[0].args.entity, {from: accounts[1]});
          beneficiaries = await trustContract.beneficiariesSignatures.call();
          assert.equal(beneficiaries.length, 2);
          let newBeneficiaryRes = await trustContract.newBeneficiary(entity3.logs[0].args.entity, {from: accounts[1]});

          let beneficiaryContract = await Beneficiary.at(newBeneficiaryRes.logs[0].args.beneficiary);
          let signaturesCount = await beneficiaryContract.countSignatures.call();
          await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[2]});
          beneficiaries = await trustContract.beneficiariesSignatures.call();
          assert.equal(beneficiaries.length, 3);
          let isBeneficiary = await trustContract.isBeneficiary.call(entity3.logs[0].args.entity);
          assert.equal(isBeneficiary, true);
      });

    });
});
