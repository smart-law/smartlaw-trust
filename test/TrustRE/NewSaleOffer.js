const TrustRE = artifacts.require('TrustRE');
const TrusteeFactory = artifacts.require('TrusteeFactory');
const EntityFactory = artifacts.require('EntityFactory');
const DexRE = artifacts.require('DexRE');
const utils = require('../Utils');

contract('TrustRE', (accounts) => {
    describe('newSaleOffer()', () => {
        it('verifies that only existing trust beneficiary can add new sale offer', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address, {from: accounts[9]});
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);

            try {
                await trustContract.newSaleOffer(10, {from: accounts[2]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('should make trust for sale', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address, {from: accounts[9]});
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            await trustContract.newSaleOffer(5, {from: accounts[3]});

            let forSale = await trustContract.forSale.call();
            assert.equal(forSale, true);
            let forSaleAmount = await trustContract.forSaleAmount.call();
            assert.equal(forSaleAmount, 5);
            let saleOffers = await trustContract.saleProposals.call();
            assert.equal(saleOffers.length, 0);
        });

        it('verifies that new sale offer fires a SaleOfferAdded event', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address, {from: accounts[9]});
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let beneficiaryEntity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            await trustContract.newBeneficiary(beneficiaryEntity.logs[0].args.entity, {from: accounts[3]});
            await trustContract.newSaleOffer(5, {from: accounts[3]});
            let res = await trustContract.newSaleOffer(15, {from: accounts[4]});
            assert(res.logs.length > 0 && res.logs[0].event == 'SaleProposalAdded');
        });

        it('should add sale offers', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address, {from: accounts[9]});
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);

            let beneficiaryEntity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            await trustContract.newBeneficiary(beneficiaryEntity.logs[0].args.entity, {from: accounts[3]});

            await trustContract.newSaleOffer(5, {from: accounts[3]});
            await trustContract.newSaleOffer(15, {from: accounts[4]});

            let forSale = await trustContract.forSale.call();
            assert.equal(forSale, false);
            let forSaleAmount = await trustContract.forSaleAmount.call();
            assert.equal(forSaleAmount, 0);
            let saleOffers = await trustContract.saleProposals.call();
            assert.equal(saleOffers.length, 2);
        });

        it('verifies that only trust not for sale can accept sale offers', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address, {from: accounts[9]});
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
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
