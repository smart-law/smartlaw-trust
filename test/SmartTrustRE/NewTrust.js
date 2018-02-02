const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const EntityFactory = artifacts.require('./EntityFactory.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('SmartTrustRE', (accounts) => {
    describe('newTrust()', () => {
        it('verifies that trust is not created when beneficiary is not an entity', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address);
            try {
                await contract.newTrust('Test Trust', 'Test Property', accounts[9], {
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
            let contract = await SmartTrustRE.new(entityFactory.address);
            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[9]});
            await contract.updateStatus(false);
            try {
                await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                  from: accounts[9]
                });
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that only smart trust owner can create trust', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address);
            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[1]});
            try {
                await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                  from: accounts[2]
                });
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('should create trust', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address);
            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[1]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[0]
            });
            let trustContract = await Trust.at(trust.logs[0].args.trust);
            let TrustName = await trustContract.name.call();
            assert.equal(TrustName, 'Test Trust');
            let TrustProperty = await trustContract.property.call();
            assert.equal(TrustProperty, 'Test Property');
        });
    });
});
