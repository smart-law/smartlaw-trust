const DexRE = artifacts.require('DexRE');
const EntityFactory = artifacts.require('EntityFactory');
const TrusteeFactory = artifacts.require('TrusteeFactory');
const Entity = artifacts.require('Entity');
const TrustRE = artifacts.require('TrustRE');
const utils = require('../Utils');

contract('DexRE', (accounts) => {
    describe('newTrust()', () => {
        it('verifies that trust is not created when beneficiary is not an entity', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            try {
                await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', accounts[9], {
                  from: accounts[0]
                });
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that only active contract can create trust', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[9]});
            await contract.updateStatus(false);
            try {
                await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                  from: accounts[9]
                });
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        // it('verifies that only DexRE owner can create trust', async () => {
        //     let entityFactory = await EntityFactory.new();
        //     let trusteeFactory = await TrusteeFactory.new();
        //     let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
        //     await entityFactory.setDexRE(contract.address);
        //     await trusteeFactory.setDexRE(contract.address);
        //     let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});
        //
        //     let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[1]});
        //     try {
        //         await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
        //           from: accounts[2]
        //         });
        //         assert(false, "didn't throw");
        //     }
        //     catch (error) {
        //         return utils.ensureException(error);
        //     }
        // });

        it('should create trust', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[1]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let TrustName = await trustContract.name.call();
            assert.equal(TrustName, 'Test Trust');
            let TrustProperty = await trustContract.property.call();
            assert.equal(TrustProperty, 'Test Property');
        });
    });
});
