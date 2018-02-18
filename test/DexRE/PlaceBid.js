const TrustRE = artifacts.require('TrustRE');
const EntityFactory = artifacts.require('EntityFactory');
const TrusteeFactory = artifacts.require('TrusteeFactory');
const DexRE = artifacts.require('DexRE');
const Loan = artifacts.require('Loan');
const Entity = artifacts.require('Entity');
const utils = require('../Utils');

contract('DexRE', (accounts) => {
    let loanData = {
        amount: 1000000000000000000,
        interest: 5 * 100,
        due: 3 * utils.SECONDS_PER_DAY
    };

    describe('placeBid()', () => {
        it('verifies that new bid fails on trust not on auction', async () => {
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
            let bidder = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );
            let auctionRunning = await trustContract.auctionRunning.call();
            assert.equal(auctionRunning, false);
            try {
                await contract.placeBid(trustContract.address, {from: accounts[4], value: loanData.amount});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that only entity owner can bid', async () => {
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
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );
            let loanContract = await Loan.at(loan.logs[0].args.loan);
            await loanContract.makeOverDue();
            await trustContract.loanDue();
            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, utils.zeroAddress);
            let auctionRunning = await trustContract.auctionRunning.call();
            assert.equal(auctionRunning, true);
            try {
                await contract.placeBid(trustContract.address, {from: accounts[5], value: loanData.amount});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that the first bid was added as highest bid', async () => {
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
            let bidder = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );
            let loanContract = await Loan.at(loan.logs[0].args.loan);
            await loanContract.makeOverDue();
            await trustContract.loanDue();
            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, utils.zeroAddress);
            let auctionRunning = await trustContract.auctionRunning.call();
            assert.equal(auctionRunning, true);
            let bid = await contract.placeBid(trustContract.address, {from: accounts[4], value: loanData.amount + (loanData.amount/4)});
            let highestBid = await trustContract.highestBid.call();
            assert.equal(highestBid, bid.logs[0].args.bid);
        });

        it('verifies that new bid less than the highest bid will fail', async () => {
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
            let bidder = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );
            let loanContract = await Loan.at(loan.logs[0].args.loan);
            await loanContract.makeOverDue();
            await trustContract.loanDue();
            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, utils.zeroAddress);
            let auctionRunning = await trustContract.auctionRunning.call();
            assert.equal(auctionRunning, true);
            let bid = await contract.placeBid(trustContract.address, {from: accounts[4], value: loanData.amount + (loanData.amount/4)});
            let highestBid = await trustContract.highestBid.call();
            assert.equal(highestBid, bid.logs[0].args.bid);
            try {
                await contract.placeBid(trustContract.address, {from: accounts[5], value: loanData.amount});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that new bid higher than the highest bid will be the new highest bid', async () => {
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
            let bidder = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );
            let loanContract = await Loan.at(loan.logs[0].args.loan);
            await loanContract.makeOverDue();
            await trustContract.loanDue();
            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, utils.zeroAddress);
            let auctionRunning = await trustContract.auctionRunning.call();
            assert.equal(auctionRunning, true);
            let bid = await contract.placeBid(trustContract.address, {from: accounts[4], value: loanData.amount + (loanData.amount/4)});
            let highestBid = await trustContract.highestBid.call();
            assert.equal(highestBid, bid.logs[0].args.bid);
            bid = await contract.placeBid(trustContract.address, {from: accounts[4], value: loanData.amount + (loanData.amount/2)});
            highestBid = await trustContract.highestBid.call();
            assert.equal(highestBid, bid.logs[0].args.bid);
        });

        it('verifies the amount was deposited to the entity once outbid', async () => {
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
            let bidder = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            let highBidder = await entityFactory.newEntity(1, true, 'PH', {from: accounts[5]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );
            let loanContract = await Loan.at(loan.logs[0].args.loan);
            await loanContract.makeOverDue();
            await trustContract.loanDue();
            let bid = await contract.placeBid(trustContract.address, {from: accounts[4], value: loanData.amount + (loanData.amount/4)});
            let lowBidderEntity = await Entity.at(bidder.logs[0].args.entity);
            let funds = await lowBidderEntity.availableFunds.call('DexRE', {from: accounts[4]});
            assert.equal(Number(funds), 0);
            bid = await contract.placeBid(trustContract.address, {from: accounts[5], value: loanData.amount + (loanData.amount/2)});
            funds = await lowBidderEntity.availableFunds.call('DexRE', {from: accounts[4]});
            assert.equal(Number(funds), loanData.amount + (loanData.amount/4));
        });

    });
});
