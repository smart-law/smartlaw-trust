const Trust = artifacts.require('./Trust.sol');
const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const utils = require('../helpers/Utils');

contract('Trust', (accounts) => {
    describe('isBeneficiary()', () => {
        it('verifies that it returns true', async () => {
            let contract = await SmartLawTrust.new();

            let entity = await contract.newEntity(1, true, {from: accounts[1]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[0]
            });
            let trustContract = await Trust.at(trust.logs[0].args.trust);
            let isBeneficiary = await trustContract.isBeneficiary.call(entity.logs[0].args.entity);
            assert.equal(isBeneficiary, true);
        });
        it('verifies that it returns false', async () => {
            let contract = await SmartLawTrust.new();

            let entity = await contract.newEntity(1, true, {from: accounts[1]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[0]
            });
            let trustContract = await Trust.at(trust.logs[0].args.trust);
            let isBeneficiary = await trustContract.isBeneficiary.call(accounts[9]);
            assert.equal(isBeneficiary, false);
        });
    });
});
