const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const Entity = artifacts.require('./Entity.sol');
const Trust = artifacts.require('./Trust.sol');
const utils = require('../helpers/Utils');

contract('SmartLawTrust', (accounts) => {
    describe('newTrust()', () => {
        it('verifies that trust is not created when beneficiary is not an entity', async () => {
            let contract = await SmartLawTrust.new({from: accounts[0]});
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
            let contract = await SmartLawTrust.new();
            let entity = await contract.newEntity(1, true, {from: accounts[9]});
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
            let contract = await SmartLawTrust.new({from: accounts[0]});
            let entity = await contract.newEntity(1, true, {from: accounts[1]});
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
            let contract = await SmartLawTrust.new({from: accounts[0]});
            let entity = await contract.newEntity(1, true, {from: accounts[1]});
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
