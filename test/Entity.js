const SmartLawTrust = artifacts.require('./SmartLawTrust.sol');
const Trust = artifacts.require('./Trust.sol');
const Entity = artifacts.require('./Entity.sol');
const utils = require('./helpers/Utils');
const Web3 = require('web3');
let web3 = new Web3(Web3.givenProvider || "ws://localhost:8546");

contract('Entity', (accounts) => {
    it('verifies the Entity after construction', async () => {
        let contract = await Entity.new(accounts[1], 1, true);
        let EntityOwner = await contract.owner.call();
        assert.equal(EntityOwner, accounts[1]);
        let EntityTrustee = await contract.trustee.call();
        assert.equal(EntityTrustee, accounts[0]);
    });

    it('verifies that only trustee can verify entity', async () => {
        let contract = await Entity.new(accounts[1], 1, true);
        try {
            await contract.verify({ from: accounts[2] });
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies entity status after verify entity action', async () => {
        let contract = await Entity.new(accounts[1], 1, true);
        await contract.verify();
        let status = await contract.verified.call();
        assert.equal(status, true);
    });

    it('verifies that only trustee can initiate ownership transfer', async () => {
        let contract = await Entity.new(accounts[1], 1, true);
        try {
            await contract.transferOwnership(accounts[1], accounts[2], { from: accounts[3] });
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies that only owner can initiate ownership transfer', async () => {
        let contract = await Entity.new(accounts[1], 1, true);
        try {
            await contract.transferOwnership(accounts[3], accounts[2]);
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies the new owner after ownership transfer', async () => {
        let contract = await Entity.new(accounts[1], 1, true);
        await contract.transferOwnership(accounts[1], accounts[2]);
        await contract.acceptOwnership(accounts[2]);
        let owner = await contract.owner.call();
        assert.equal(owner, accounts[2]);
    });

    it('verifies that newOwner is cleared after ownership transfer', async () => {
        let contract = await Entity.new(accounts[1], 1, true);
        await contract.transferOwnership(accounts[1], accounts[2]);
        await contract.acceptOwnership(accounts[2]);
        let newOwner = await contract.newOwner.call();
        assert.equal(newOwner, utils.zeroAddress);
    });

    it('verifies that the owner can cancel ownership transfer before the new owner accepted it', async () => {
        let contract = await Entity.new(accounts[1], 1, true);
        await contract.transferOwnership(accounts[1], accounts[2]);
        await contract.transferOwnership(accounts[1], '0x0');
        let newOwner = await contract.newOwner.call();
        assert.equal(newOwner, utils.zeroAddress);
    });

    it('verifies that only trustee can initiate ownership acceptance', async () => {
        let contract = await Entity.new(accounts[1], 1, true);
        await contract.transferOwnership(accounts[1], accounts[2]);
        try {
            await contract.acceptOwnership(accounts[2], { from: accounts[3] });
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies that only new owner can accept ownership', async () => {
        let contract = await Entity.new(accounts[1], 1, true);
        await contract.transferOwnership(accounts[1], accounts[2]);
        try {
            await contract.acceptOwnership(accounts[3]);
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies that it has zero funds on new entity', async () => {
        let contract = await Entity.new(accounts[1], 1, true);
        let balance = await contract.availableFunds.call({from: accounts[1]});
        assert.equal(Number(balance), 0);
    });

    it('verifies that only trustee can initiate sweep funds', async () => {
        let contract = await Entity.new(accounts[1], 1, true);
        try {
            await contract.sweepFunds({ from: accounts[3] });
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies that it has zero funds after sweep funds', async () => {
        let contract = await Entity.new(accounts[1], 1, true);
        await contract.deposit(100);
        let balance = await contract.availableFunds.call();
        assert.equal(Number(balance), 100);
        await contract.sweepFunds();
        balance = await contract.availableFunds.call();
        assert.equal(Number(balance), 0);
    });

    it('verifies that only owner can withdraw funds from entity', async () => {
        let contract = await Entity.new(accounts[3], 1, true);
        try {
            await contract.withdraw({ from: accounts[2] });
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });
    it('verifies the Entity able to withdraw and funds was set to 0 after', async () => {
        let origBalance = await web3.eth.getBalance(accounts[3]);
        let contract = await SmartLawTrust.new({from: accounts[9]});
        let entity = await contract.newEntity(1, true, {from: accounts[3]});
        let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
            from: accounts[9]
        });
        let amount = 1000000000000000000;
        let buyer = await contract.newEntity(1, true, {from: accounts[4]});
        let trustContract = await Trust.at(trust.logs[0].args.trust);
        await trustContract.newSaleOffer(amount, {from: accounts[3]});
        let forSale = await trustContract.forSale.call();
        let forSaleAmount = await trustContract.forSaleAmount.call();
        await contract.buyTrust(trust.logs[0].args.trust, {from: accounts[4], value: amount});
        let entityContract = await Entity.at(entity.logs[0].args.entity);
        let funds = await entityContract.availableFunds({from: accounts[3]});
        let owner = await entityContract.owner.call();
        await entityContract.withdraw({ from: accounts[3] });
        let balance = await web3.eth.getBalance(accounts[3]);
        assert.isAbove(Number(balance), (Number(origBalance)));
        funds = await entityContract.availableFunds({from: accounts[3]});
        assert.equal(funds, 0);
    });
});
