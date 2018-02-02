const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('Trust', (accounts) => {
    describe('Trust()', () => {
        it('verifies the trust after construction', async () => {
          let contract = await Trust.new('Test Trust', 'Test Property', accounts[1]);
          let trustee = await contract.trustee.call();
          assert.equal(trustee, accounts[0]);
          let name = await contract.name.call();
          assert.equal(name, 'Test Trust');
          let property = await contract.property.call();
          assert.equal(property, 'Test Property');
          let isBeneficiary = await contract.isBeneficiary.call(accounts[1]);
          assert.equal(isBeneficiary, true);
          let beneficiaries = await contract.beneficiariesSignatures.call();
          assert.equal(beneficiaries.length, 1);
          let dissolveSignatures = await contract.getDissolveSignatures.call();
          assert.equal(dissolveSignatures.length, 0);
          let saleOffers = await contract.saleOffers.call();
          assert.equal(saleOffers.length, 0);
          let deleted = await contract.deleted.call();
          assert.equal(deleted, false);
        });
    });
});
