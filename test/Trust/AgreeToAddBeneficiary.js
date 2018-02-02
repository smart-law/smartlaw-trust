const Trust = artifacts.require('./Trust.sol');
const EntityFactory = artifacts.require('./EntityFactory.sol');
const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const Beneficiary = artifacts.require('./Beneficiary.sol');
const utils = require('../helpers/Utils');

contract('Trust', (accounts) => {
    describe('agreeToAddBeneficiary()', () => {
      it('verifies that only existing trust beneficiary can sign to add new beneficiary', async () => {
          let entityFactory = await EntityFactory.new();
          let contract = await SmartTrustRE.new(entityFactory.address);

          let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[1]});
          let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
              from: accounts[0]
          });
          let trustContract = await Trust.at(trust.logs[0].args.trust);
          let entity2 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[2]});
          let entity3 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});

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
          let contract = await SmartTrustRE.new(entityFactory.address);

          let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[1]});
          let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
              from: accounts[0]
          });
          let trustContract = await Trust.at(trust.logs[0].args.trust);
          let entity2 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[2]});
          let entity3 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
          let entity4 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});

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
          let contract = await SmartTrustRE.new(entityFactory.address);

          let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[1]});
          let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
              from: accounts[0]
          });
          let trustContract = await Trust.at(trust.logs[0].args.trust);
          let beneficiaries = await trustContract.beneficiariesSignatures.call();
          assert.equal(beneficiaries.length, 1);
          let entity2 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[2]});
          let entity3 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});

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
