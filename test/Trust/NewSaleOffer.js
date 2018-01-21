const Trust = artifacts.require('./Trust.sol');
const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const utils = require('../helpers/Utils');

contract('Trust', (accounts) => {
    describe('newSaleOffer()', () => {
        it('verifies that only existing trust beneficiary can add new sale offer', async () => {
            let contract = await SmartLawTrust.new({from: accounts[9]});

            let entity = await contract.newEntity(1, true, {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await Trust.at(trust.logs[0].args.trust);

            try {
                await trustContract.newSaleOffer(10, {from: accounts[2]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('should make trust for sale', async () => {
            let contract = await SmartLawTrust.new({from: accounts[9]});

            let entity = await contract.newEntity(1, true, {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await Trust.at(trust.logs[0].args.trust);
            await trustContract.newSaleOffer(5, {from: accounts[3]});

            let forSale = await trustContract.forSale.call();
            assert.equal(forSale, true);
            let forSaleAmount = await trustContract.forSaleAmount.call();
            assert.equal(forSaleAmount, 5);
            let saleOffers = await trustContract.saleOffers.call();
            assert.equal(saleOffers.length, 0);
        });

        it('verifies that new sale offer fires a SaleOfferAdded event', async () => {
            let contract = await SmartLawTrust.new({from: accounts[9]});

            let entity = await contract.newEntity(1, true, {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let beneficiaryEntity = await contract.newEntity(1, true, {from: accounts[4]});
            let trustContract = await Trust.at(trust.logs[0].args.trust);
            await trustContract.newBeneficiary(beneficiaryEntity.logs[0].args.entity, {from: accounts[3]});
            await trustContract.newSaleOffer(5, {from: accounts[3]});
            let res = await trustContract.newSaleOffer(15, {from: accounts[4]});
            assert(res.logs.length > 0 && res.logs[0].event == 'SaleOfferAdded');
        });

        it('should add sale offers', async () => {
            let contract = await SmartLawTrust.new({from: accounts[9]});

            let entity = await contract.newEntity(1, true, {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await Trust.at(trust.logs[0].args.trust);

            let beneficiaryEntity = await contract.newEntity(1, true, {from: accounts[4]});
            await trustContract.newBeneficiary(beneficiaryEntity.logs[0].args.entity, {from: accounts[3]});

            await trustContract.newSaleOffer(5, {from: accounts[3]});
            await trustContract.newSaleOffer(15, {from: accounts[4]});

            let forSale = await trustContract.forSale.call();
            assert.equal(forSale, false);
            let forSaleAmount = await trustContract.forSaleAmount.call();
            assert.equal(forSaleAmount, 0);
            let saleOffers = await trustContract.saleOffers.call();
            assert.equal(saleOffers.length, 2);
        });

        it('verifies that only trust not for sale can accept sale offers', async () => {
            let contract = await SmartLawTrust.new({from: accounts[9]});

            let entity = await contract.newEntity(1, true, {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await Trust.at(trust.logs[0].args.trust);
            await trustContract.newSaleOffer(5, {from: accounts[3]});

            try {
                await trustContract.newSaleOffer(10, {from: accounts[3]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });
    });
});
