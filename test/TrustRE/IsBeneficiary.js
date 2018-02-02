const TrustRE = artifacts.require('./TrustRE.sol');
const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const EntityFactory = artifacts.require('./EntityFactory.sol');
const utils = require('../helpers/Utils');

contract('TrustRE', (accounts) => {
    describe('isBeneficiary()', () => {
        it('verifies that it returns true', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address);

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[1]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[0]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let isBeneficiary = await trustContract.isBeneficiary.call(entity.logs[0].args.entity);
            assert.equal(isBeneficiary, true);
        });
        it('verifies that it returns false', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address);

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[1]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[0]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let isBeneficiary = await trustContract.isBeneficiary.call(accounts[9]);
            assert.equal(isBeneficiary, false);
        });
    });
});
