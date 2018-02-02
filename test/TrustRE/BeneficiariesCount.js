const TrustRE = artifacts.require('./TrustRE.sol');
const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const EntityFactory = artifacts.require('./EntityFactory.sol');
const Beneficiary = artifacts.require('./Beneficiary.sol');
const utils = require('../helpers/Utils');

contract('TrustRE', (accounts) => {
    describe('beneficiariesCount()', () => {
      it('should return correct beneficiaries count', async () => {
          let entityFactory = await EntityFactory.new();
          let contract = await SmartTrustRE.new(entityFactory.address);

          let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[1]});
          let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
              from: accounts[0]
          });
          let trustContract = await TrustRE.at(trust.logs[0].args.trust);
          let beneficiaries = await trustContract.beneficiariesSignatures.call();
          assert.equal(beneficiaries.length, 1);
          let entity2 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[2]});
          let entity3 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});

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
