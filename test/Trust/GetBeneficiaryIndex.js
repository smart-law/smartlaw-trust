const Trust = artifacts.require('./Trust.sol');
const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const EntityFactory = artifacts.require('./EntityFactory.sol');
const Beneficiary = artifacts.require('./Beneficiary.sol');
const utils = require('../helpers/Utils');

contract('Trust', (accounts) => {
    describe('getBeneficiaryByIndex()', () => {
      it('should return correct beneficiary', async () => {
          let entityFactory = await EntityFactory.new();
          let contract = await SmartTrustRE.new(entityFactory.address);

          let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[1]});
          let entity2 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[2]});
          let entity3 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
          let entity4 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
          let entity5 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[5]});

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
