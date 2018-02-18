const User = artifacts.require('User');
const TrustRE = artifacts.require('TrustRE');
const TrusteeFactory = artifacts.require('TrusteeFactory');
const EntityFactory = artifacts.require('EntityFactory');
const DexRE = artifacts.require('DexRE');
const Beneficiary = artifacts.require('Beneficiary');
const Entity = artifacts.require('Entity');
const utils = require('./Utils');
const Web3 = require('web3');
let web3 = new Web3(Web3.givenProvider || "ws://localhost:8546");

contract('User', (accounts) => {

    describe('User()', (done) => {
        it('verifies user fields after construction', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            let factory = await contract.factory.call();
            assert.equal(factory, accounts[0]);
            let owner = await contract.owner.call();
            assert.equal(owner, accounts[1]);
            let newOwner = await contract.newOwner.call();
            assert.equal(newOwner, utils.zeroAddress);
            let dexRE = await contract.DexREAdmin.call();
            assert.equal(dexRE, accounts[2]);
            let liquidRE = await contract.LiquidREAdmin.call();
            assert.equal(liquidRE, accounts[3]);
            let verified = await contract.verified.call();
            assert.equal(verified, false);
            let fundsDexRE = await contract.availableFunds.call('DexRE');
            assert.equal(Number(fundsDexRE), 0);
            let fundsLiquidRE = await contract.availableFunds.call('LiquidRE');
            assert.equal(Number(fundsLiquidRE), 0);
            let status = await contract.status.call();
            assert.equal(status, true);
        });
    });

    describe('disabled()', () => {
        it('verifies status value after disabled', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            await contract.disabled({ from: accounts[2] });
            let status = await contract.status.call();
            assert.equal(status, false);
        });
    });

    describe('verify()', () => {
        it('verifies that only dexRE can verify user', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            try {
                await contract.verify.call({ from: accounts[4] });
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies user status after verify user action', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            await contract.verify({from: accounts[2]});
            let status = await contract.verified.call();
            assert.equal(status, true);
        });
    });

    describe('deposit()', () => {
        it('verifies that only dexRE can deposit', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            try {
                await contract.deposit(100, 'DexRE', { from: accounts[1] });
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that deposit fails on an unknown source', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            try {
                await contract.deposit(100, 'DexREs', { from: accounts[4] });
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies user funds after successful deposit', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            await contract.deposit(100, 'DexRE', { from: accounts[2] });
            await contract.deposit(100, 'LiquidRE', { from: accounts[2] });
            let fundsDexRE = await contract.availableFunds.call('DexRE');
            assert.equal(Number(fundsDexRE), 100);
            let fundsLiquidRE = await contract.availableFunds.call('LiquidRE');
            assert.equal(Number(fundsLiquidRE), 100);
            await contract.deposit(1000, 'DexRE', { from: accounts[2] });
            await contract.deposit(1000, 'LiquidRE', { from: accounts[2] });
            fundsDexRE = await contract.availableFunds.call('DexRE');
            assert.equal(Number(fundsDexRE), 1100);
            fundsLiquidRE = await contract.availableFunds.call('LiquidRE');
            assert.equal(Number(fundsLiquidRE), 1100);
        });
    });

    describe('mint()', () => {
        it('verifies that only dexRE can mint funds', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            await contract.deposit(100, 'DexRE', { from: accounts[2] });
            try {
                await contract.mint(100, 'DexRE', { from: accounts[1] });
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that mint fails on an unknown source', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            await contract.deposit(100, 'DexRE', { from: accounts[2] });
            try {
                await contract.mint(100, 'DexREs', { from: accounts[2] });
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that mint fails on an amount greater than funds available', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            await contract.deposit(100, 'DexRE', { from: accounts[2] });
            try {
                await contract.mint(105, 'DexRE', { from: accounts[2] });
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies user funds after successful mint', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            await contract.deposit(100, 'DexRE', { from: accounts[2] });
            await contract.deposit(100, 'LiquidRE', { from: accounts[2] });
            let fundsDexRE = await contract.availableFunds.call('DexRE');
            assert.equal(Number(fundsDexRE), 100);
            let fundsLiquidRE = await contract.availableFunds.call('LiquidRE');
            assert.equal(Number(fundsLiquidRE), 100);
            await contract.deposit(1000, 'DexRE', { from: accounts[2] });
            await contract.deposit(1000, 'LiquidRE', { from: accounts[2] });
            fundsDexRE = await contract.availableFunds.call('DexRE');
            assert.equal(Number(fundsDexRE), 1100);
            fundsLiquidRE = await contract.availableFunds.call('LiquidRE');
            assert.equal(Number(fundsLiquidRE), 1100);

            await contract.mint(900, 'DexRE', { from: accounts[2] });
            await contract.mint(800, 'LiquidRE', { from: accounts[2] });

            fundsDexRE = await contract.availableFunds.call('DexRE');
            assert.equal(Number(fundsDexRE), 200);
            fundsLiquidRE = await contract.availableFunds.call('LiquidRE');
            assert.equal(Number(fundsLiquidRE), 300);
        });
    });

    describe('transferOwnership()', () => {
        it('verifies that only owner and factory contract can initiate ownership transfer', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            try {
                await contract.transferOwnership(accounts[3], accounts[9], {from: accounts[8]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies the new owner after ownership transfer', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            await contract.transferOwnership(accounts[1], accounts[9]);
            await contract.acceptOwnership(accounts[9],{from: accounts[0]});
            let owner = await contract.owner.call();
            assert.equal(owner, accounts[9]);
        });

        it('verifies that new owner is cleared after ownership transfer', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            await contract.transferOwnership(accounts[1], accounts[9]);
            await contract.acceptOwnership(accounts[9],{from: accounts[0]});
            let newOwner = await contract.newOwner.call();
            assert.equal(newOwner, utils.zeroAddress);
        });

        it('verifies that the owner can cancel ownership transfer before the new owner accepted it', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            await contract.transferOwnership(accounts[1], accounts[9]);
            await contract.transferOwnership(accounts[1], '0x0');
            let newOwner = await contract.newOwner.call();
            assert.equal(newOwner, utils.zeroAddress);
        });
    });

    describe('acceptOwnership()', () => {
        it('verifies that only factory can initiate ownership acceptance', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            await contract.transferOwnership(accounts[1], accounts[9]);
            try {
                await contract.acceptOwnership(accounts[9], { from: accounts[4] });
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that only new owner can accept ownership', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            await contract.transferOwnership(accounts[1], accounts[9]);
            try {
                await contract.acceptOwnership(accounts[5], { from: accounts[0] });
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });
    });

    describe('withdraw()', () => {

        it('verifies that only owner can withdraw funds', async () => {
            let contract = await User.new(
                accounts[0], // factory
                accounts[1], // owner
                accounts[2], // dexRE
                accounts[3]  // liquidRE
            );
            try {
                await contract.withdraw(0, 'DexRE', { from: accounts[2] });
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that user able to withdraw and funds left are correct', async () => {
            let origBalance = await web3.eth.getBalance(accounts[3]);

            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let amount = 1000000000000000000;
            let buyer = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            await trustContract.newSaleOffer(amount, {from: accounts[3]});
            let forSale = await trustContract.forSale.call();
            let forSaleAmount = await trustContract.forSaleAmount.call();
            await contract.buyTrust(trust.logs[0].args.trust, {from: accounts[4], value: amount});
            let entityContract = await Entity.at(entity.logs[0].args.entity);
            let funds = await entityContract.availableFunds('DexRE', {from: accounts[3]});
            let owner = await entityContract.owner.call();
            await entityContract.withdraw(amount, 'DexRE', { from: accounts[3] });
            let balance = await web3.eth.getBalance(accounts[3]);
            assert.isAbove(Number(balance), (Number(origBalance)));
            funds = await entityContract.availableFunds('DexRE', {from: accounts[3]});
            assert.equal(funds, 0);
        });

        it('verifies that user able to withdraw and funds left are correct', async () => {
            let origBalance = await web3.eth.getBalance(accounts[3]);

            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let amount = 1000000000000000000;
            let buyer = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            await trustContract.newSaleOffer(amount, {from: accounts[3]});
            let forSale = await trustContract.forSale.call();
            let forSaleAmount = await trustContract.forSaleAmount.call();
            await contract.buyTrust(trust.logs[0].args.trust, {from: accounts[4], value: amount});
            let entityContract = await Entity.at(entity.logs[0].args.entity);
            let funds = await entityContract.availableFunds('DexRE', {from: accounts[3]});
            let owner = await entityContract.owner.call();
            await entityContract.withdraw((amount / 2), 'DexRE', { from: accounts[3] });
            let balance = await web3.eth.getBalance(accounts[3]);
            assert.isAbove(Number(balance), (Number(origBalance)));
            funds = await entityContract.availableFunds('DexRE', {from: accounts[3]});
            assert.equal(funds, (amount / 2));
        });

    });

});
