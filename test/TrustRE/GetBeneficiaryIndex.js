const TrustRE = artifacts.require('TrustRE');
const DexRE = artifacts.require('DexRE');
const EntityFactory = artifacts.require('EntityFactory');
const TrusteeFactory = artifacts.require('TrusteeFactory');
const Beneficiary = artifacts.require('Beneficiary');
const utils = require('../Utils');

contract('TrustRE', (accounts) => {
    describe('getBeneficiaryByIndex()', () => {
      it('should return correct beneficiary', async () => {
          let entityFactory = await EntityFactory.new();
          let trusteeFactory = await TrusteeFactory.new();
          let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
          await entityFactory.setDexRE(contract.address);
          await trusteeFactory.setDexRE(contract.address);
          let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

          let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[1]});
          let entity2 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[2]});
          let entity3 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
          let entity4 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
          let entity5 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[5]});

          let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
              from: accounts[0]
          });
          let trustContract = await TrustRE.at(trust.logs[0].args.trust);
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
