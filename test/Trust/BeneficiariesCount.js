const Trust = artifacts.require('./Trust.sol');
const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const Beneficiary = artifacts.require('./Beneficiary.sol');
const utils = require('../helpers/Utils');

contract('Trust', (accounts) => {
    describe('beneficiariesCount()', () => {
      it('should return correct beneficiaries count', async () => {
          let contract = await SmartLawTrust.new();

          let entity = await contract.newEntity(1, true, {from: accounts[1]});
          let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
              from: accounts[0]
          });
          let trustContract = await Trust.at(trust.logs[0].args.trust);
          let beneficiaries = await trustContract.beneficiariesSignatures.call();
          assert.equal(beneficiaries.length, 1);
          let entity2 = await contract.newEntity(1, true, {from: accounts[2]});
          let entity3 = await contract.newEntity(1, true, {from: accounts[3]});

          await trustContract.newBeneficiary(entity2.logs[0].args.entity, {from: accounts[1]});
          beneficiaries = await trustContract.beneficiariesSignatures.call();
          assert.equal(beneficiaries.length, 2);
          let newBeneficiaryRes = await trustContract.newBeneficiary(entity3.logs[0].args.entity, {from: accounts[1]});
          await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[2]});
          
          beneficiaries = await trustContract.beneficiariesCount.call();
          assert.equal(Number(beneficiaries), 3);
      });
    });
});
