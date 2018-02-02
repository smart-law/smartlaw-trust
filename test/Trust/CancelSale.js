const Trust = artifacts.require('./Trust.sol');
const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const EntityFactory = artifacts.require('./EntityFactory.sol');
const Sale = artifacts.require('./Sale.sol');
const utils = require('../helpers/Utils');

contract('Trust', (accounts) => {
    describe('cancelSale()', () => {
        it('verifies that only existing trust beneficiary can cancel sale', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let entity2 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            let entity3 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[5]});
            let trustContract = await Trust.at(trust.logs[0].args.trust);
            await trustContract.newBeneficiary(entity2.logs[0].args.entity, {from: accounts[3]});
            let newBeneficiaryRes = await trustContract.newBeneficiary(entity3.logs[0].args.entity, {from: accounts[3]});
            await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[4]});

            await trustContract.newSaleOffer(5, {from: accounts[3]});
            await trustContract.newSaleOffer(15, {from: accounts[4]});
            await trustContract.newSaleOffer(25, {from: accounts[5]});
            let saleOffer = await trustContract.newSaleOffer(55, {from: accounts[3]});
            let saleContract = await Sale.at(saleOffer.logs[0].args.sale);
            await trustContract.agreeToSaleOffer(saleOffer.logs[0].args.sale, {from: accounts[5]});
            await trustContract.agreeToSaleOffer(saleOffer.logs[0].args.sale, {from: accounts[4]});

            try {
                await trustContract.cancelSale({from: accounts[2]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that only trust for sale can be cancelled', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await Trust.at(trust.logs[0].args.trust);
            try {
                await trustContract.cancelSale({from: accounts[3]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('should make trust not for sale', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let entity2 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            let entity3 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[5]});
            let trustContract = await Trust.at(trust.logs[0].args.trust);
            await trustContract.newBeneficiary(entity2.logs[0].args.entity, {from: accounts[3]});
            let newBeneficiaryRes = await trustContract.newBeneficiary(entity3.logs[0].args.entity, {from: accounts[3]});
            await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[4]});

            await trustContract.newSaleOffer(5, {from: accounts[3]});
            await trustContract.newSaleOffer(15, {from: accounts[4]});
            await trustContract.newSaleOffer(25, {from: accounts[5]});
            let saleOffer = await trustContract.newSaleOffer(55, {from: accounts[3]});
            let saleContract = await Sale.at(saleOffer.logs[0].args.sale);
            await trustContract.agreeToSaleOffer(saleOffer.logs[0].args.sale, {from: accounts[5]});
            await trustContract.agreeToSaleOffer(saleOffer.logs[0].args.sale, {from: accounts[4]});

            let forSale = await trustContract.forSale.call();
            assert.equal(forSale, true);
            let forSaleAmount = await trustContract.forSaleAmount.call();
            assert.equal(forSaleAmount, 55);
            let saleOffers = await trustContract.saleOffers.call();
            assert.equal(saleOffers.length, 0);
            await trustContract.cancelSale({from: accounts[4]});
            forSale = await trustContract.forSale.call();
            assert.equal(forSale, false);
            forSaleAmount = await trustContract.forSaleAmount.call();
            assert.equal(forSaleAmount, 0);

        });
    });
});
