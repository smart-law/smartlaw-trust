const Trust = artifacts.require('./Trust.sol');
const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const Beneficiary = artifacts.require('./Beneficiary.sol');
const utils = require('../helpers/Utils');

contract('Trust', (accounts) => {
    describe('getBeneficiaryByIndex()', () => {
      it('should return correct beneficiary', async () => {
          let contract = await SmartLawTrust.new();

          let entity = await contract.newEntity(1, true, {from: accounts[1]});
          let entity2 = await contract.newEntity(1, true, {from: accounts[2]});
          let entity3 = await contract.newEntity(1, true, {from: accounts[3]});
          let entity4 = await contract.newEntity(1, true, {from: accounts[4]});
          let entity5 = await contract.newEntity(1, true, {from: accounts[5]});

          let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
              from: accounts[0]
          });
          let trustContract = await Trust.at(trust.logs[0].args.trust);
          let beneficiaries = await trustContract.beneficiariesSignatures.call();
          assert.equal(beneficiaries.length, 1);

          await trustContract.newBeneficiary(entity2.logs[0].args.entity, {from: accounts[1]});
          let newBeneficiaryRes = await trustContract.newBeneficiary(entity3.logs[0].args.entity, {from: accounts[1]});
          await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[2]});

          let beneficiaryList = [
              entity.logs[0].args.entity,
              entity2.logs[0].args.entity,
              entity3.logs[0].args.entity
          ];

          beneficiaries = await trustContract.beneficiariesCount.call();
          for(let i = 0; i < Number(beneficiaries); i++) {
              let beneficiary = await trustContract.getBeneficiaryByIndex.call(i);
              assert.equal(beneficiaryList[i], beneficiary);
          }
      });
    });
});
