const TrustRE = artifacts.require('./TrustRE.sol');
const EntityFactory = artifacts.require('./EntityFactory.sol');
const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const Loan = artifacts.require('./Loan.sol');
const utils = require('../helpers/Utils');


contract('TrustRE', (accounts) => {
    let loanData = {
        amount: 1000000000000000000,
        interest: 5 * 100,
        due: 3 * utils.SECONDS_PER_DAY
    };

    describe('auctionEnd()', () => {
        it('verifies that auction will not stop until auction end date(14 days after loan due)', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
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
                await trustContract.auctionEnd();
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that lender becomes the new trust beneficiary)', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let lender = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );
            await contract.fundLoan(
              trust.logs[0].args.trust,
              {
                from: accounts[4],
                value: loanData.amount
              }
            );
            let loanContract = await Loan.at(loan.logs[0].args.loan);
            await loanContract.makeOverDue();
            await trustContract.loanDue();
            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, utils.zeroAddress);
            let auctionRunning = await trustContract.auctionRunning.call();
            assert.equal(auctionRunning, true);
            await trustContract.makeAuctionEnd();
            await trustContract.auctionEnd();
            let isBeneficiary = await trustContract.isBeneficiary(lender.logs[0].args.entity);
        });

        it('verifies that the highest bidder becomes the new trust beneficiary)', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let lender = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );
            await contract.fundLoan(
              trust.logs[0].args.trust,
              {
                from: accounts[4],
                value: loanData.amount
              }
            );
            let loanContract = await Loan.at(loan.logs[0].args.loan);
            await loanContract.makeOverDue();
            await trustContract.loanDue();
            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, utils.zeroAddress);
            let auctionRunning = await trustContract.auctionRunning.call();
            assert.equal(auctionRunning, true);
            await trustContract.makeAuctionEnd();
            await trustContract.auctionEnd();
            let isBeneficiary = await trustContract.isBeneficiary(lender.logs[0].args.entity);
        });

    });
});
