const EntityFactory = artifacts.require('./EntityFactory.sol');
const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const Entity = artifacts.require('./Entity.sol');
const TrustRE = artifacts.require('./TrustRE.sol');
const utils = require('../helpers/Utils');

contract('SmartTrustRE', (accounts) => {
    describe('buyTrust()', () => {
        it('verifies that only entity owner can buy trust', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            await trustContract.newSaleOffer(5, {from: accounts[3]});
            let forSale = await trustContract.forSale.call();
            assert.equal(forSale, true);
            let forSaleAmount = await trustContract.forSaleAmount.call();
            assert.equal(Number(forSaleAmount), 5);
            try {
                await contract.buyTrust(accounts[6], {from: accounts[7]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that only for sale trust can be bought', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let buyer = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            try {
                await contract.buyTrust(trust.logs[0].args.trust, {from: accounts[4]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that buying trust failed on amount less than the for sale amount', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let buyer = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            await trustContract.newSaleOffer(1000000000000000000, {from: accounts[3]});
            let forSale = await trustContract.forSale.call();
            assert.equal(forSale, true);
            let forSaleAmount = await trustContract.forSaleAmount.call();
            assert.equal(Number(forSaleAmount), 1000000000000000000);
            try {
                await contract.buyTrust(trust.logs[0].args.trust, {from: accounts[4], value: 500000000000000000});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that beneficiary will have the total amount of the trust sold', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let amount = 1000000000000000000;
            let buyer = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            await trustContract.newSaleOffer(amount, {from: accounts[3]});
            let forSale = await trustContract.forSale.call();
            assert.equal(forSale, true);
            let forSaleAmount = await trustContract.forSaleAmount.call();
            assert.equal(Number(forSaleAmount), amount);
            await contract.buyTrust(trust.logs[0].args.trust, {from: accounts[4], value: amount});
            let entityContract = await Entity.at(entity.logs[0].args.entity);
            let funds = await entityContract.availableFunds({from: accounts[3]});
            assert.equal(funds, amount);
        });

        it('verifies that beneficiaries will have correct amount when for sale amount of the trust sold was equally divided', async () => {
            let amount = 1000000000000000000;
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let entity2 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            let entity3 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[5]});
            let entity4 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[6]});

            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);

            await trustContract.newBeneficiary(entity2.logs[0].args.entity, {from: accounts[3]});
            let newBeneficiaryRes = await trustContract.newBeneficiary(entity3.logs[0].args.entity, {from: accounts[3]});
            await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[4]});
            newBeneficiaryRes = await trustContract.newBeneficiary(entity4.logs[0].args.entity, {from: accounts[3]});
            await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[4]});
            await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[5]});

            let beneficiariesCount = await trustContract.beneficiariesCount.call();

            let buyer = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[8]});
            let saleOffer = await trustContract.newSaleOffer(amount, {from: accounts[3]});
            await trustContract.agreeToSaleOffer(saleOffer.logs[0].args.sale, {from: accounts[4]});
            await trustContract.agreeToSaleOffer(saleOffer.logs[0].args.sale, {from: accounts[5]});
            await trustContract.agreeToSaleOffer(saleOffer.logs[0].args.sale, {from: accounts[6]});

            let forSale = await trustContract.forSale.call();
            assert.equal(forSale, true);
            let forSaleAmount = await trustContract.forSaleAmount.call();
            assert.equal(Number(forSaleAmount), amount);
            await contract.buyTrust(trust.logs[0].args.trust, {from: accounts[8], value: amount});

            let beneficiaries = [
              { owner:accounts[3], entity: entity.logs[0].args.entity},
              { owner:accounts[4], entity: entity2.logs[0].args.entity},
              { owner:accounts[5], entity: entity3.logs[0].args.entity},
              { owner:accounts[6], entity: entity4.logs[0].args.entity}
            ];

            for(let i = 0; i < beneficiaries.length; i++) {
              let entityContract = await Entity.at(beneficiaries[i].entity);
              let funds = await entityContract.availableFunds({from: beneficiaries[i].owner});
              assert.equal(funds, (amount / beneficiaries.length));
            }
        });

        it('verifies that beneficiaries will have correct amount when for sale amount of the trust sold was equally divided', async () => {
            let amount = 1000000000000000000;
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let entity2 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            let entity3 = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[5]});

            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);

            await trustContract.newBeneficiary(entity2.logs[0].args.entity, {from: accounts[3]});
            let newBeneficiaryRes = await trustContract.newBeneficiary(entity3.logs[0].args.entity, {from: accounts[3]});
            await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[4]});

            let beneficiariesCount = await trustContract.beneficiariesCount.call();

            let buyer = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[8]});
            let saleOffer = await trustContract.newSaleOffer(amount, {from: accounts[3]});
            await trustContract.agreeToSaleOffer(saleOffer.logs[0].args.sale, {from: accounts[4]});
            await trustContract.agreeToSaleOffer(saleOffer.logs[0].args.sale, {from: accounts[5]});

            let forSale = await trustContract.forSale.call();
            assert.equal(forSale, true);
            let forSaleAmount = await trustContract.forSaleAmount.call();
            assert.equal(Number(forSaleAmount), amount);
            await contract.buyTrust(trust.logs[0].args.trust, {from: accounts[8], value: amount});

            let beneficiaries = [
              { owner:accounts[3], entity: entity.logs[0].args.entity},
              { owner:accounts[4], entity: entity2.logs[0].args.entity},
              { owner:accounts[5], entity: entity3.logs[0].args.entity},
            ];

            for(let i = 0; i < beneficiaries.length; i++) {
              let entityContract = await Entity.at(beneficiaries[i].entity);
              let funds = await entityContract.availableFunds({from: beneficiaries[i].owner});
              assert.equal(Number(funds), (amount / beneficiaries.length));
            }
        });
    });
});
