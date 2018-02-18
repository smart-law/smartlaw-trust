const TrustRE = artifacts.require('TrustRE');
const DexRE = artifacts.require('DexRE');
const EntityFactory = artifacts.require('EntityFactory');
const TrusteeFactory = artifacts.require('TrusteeFactory');
const utils = require('../Utils');

contract('TrustRE', (accounts) => {
    describe('isBeneficiary()', () => {
        it('verifies that it returns true', async () => {
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
            let isBeneficiary = await trustContract.isBeneficiary.call(entity.logs[0].args.entity);
            assert.equal(isBeneficiary, true);
        });
        it('verifies that it returns false', async () => {
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
            let isBeneficiary = await trustContract.isBeneficiary.call(accounts[9]);
            assert.equal(isBeneficiary, false);
        });
    });
});
