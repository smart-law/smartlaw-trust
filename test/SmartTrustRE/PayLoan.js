const EntityFactory = artifacts.require('./EntityFactory.sol');
const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const Entity = artifacts.require('./Entity.sol');
const Loan = artifacts.require('./Loan.sol');
const TrustRE = artifacts.require('./TrustRE.sol');
const utils = require('../helpers/Utils');

contract('SmartTrustRE', (accounts) => {
    let loanData = {
        amount: 1000000000000000000,
        interest: 5 * 100,
        due: 3 * utils.SECONDS_PER_DAY
    };

    describe('payLoan()', () => {
        it('verifies that only trust with active loan and was funded can be paid', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let buyer = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );

            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, loan.logs[0].args.loan);
            let loanAmount = await trustContract.loanAmount.call();
            assert.equal(Number(loanAmount), loanData.amount);
            try {
                await contract.payLoan(
                  trust.logs[0].args.trust,
                  {
                    from: accounts[4],
                    value: loanData.amount
                  }
                );
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that paying trust loan failed on amount less than the loan amount due', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let buyer = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});

            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );

            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, loan.logs[0].args.loan);
            let loanAmount = await trustContract.loanAmount.call();
            assert.equal(Number(loanAmount), loanData.amount);
            await contract.fundLoan(trust.logs[0].args.trust, {from: accounts[4], value: loanData.amount});

            try {
                await contract.payLoan(trust.logs[0].args.trust, {from: accounts[3], value: loanData.amount / 2});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that lender got the total loan amount due', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let buyer = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});

            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );

            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, loan.logs[0].args.loan);
            let loanAmount = await trustContract.loanAmount.call();
            assert.equal(Number(loanAmount), loanData.amount);
            await contract.fundLoan(trust.logs[0].args.trust, {from: accounts[4], value: loanData.amount});
            let loanContract = await Loan.at(activeLoan);
            let loanInterest = await loanContract.interest.call();
            assert.equal(Number(loanInterest), loanData.interest);
            let loanAmountDue = await loanContract.amountDue.call();
            let lender = await trustContract.lender.call();
            await contract.payLoan(trust.logs[0].args.trust, {from: accounts[3], value: Number(loanAmountDue)});
            let entityContract = await Entity.at(lender);
            let funds = await entityContract.availableFunds({from: accounts[4]});
            assert.equal(Number(funds), Number(loanAmountDue));
        });

        it('verifies that active loan and lender was reset', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let buyer = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});

            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );

            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, loan.logs[0].args.loan);
            let loanAmount = await trustContract.loanAmount.call();
            assert.equal(Number(loanAmount), loanData.amount);
            await contract.fundLoan(trust.logs[0].args.trust, {from: accounts[4], value: loanData.amount});
            let loanContract = await Loan.at(activeLoan);
            let loanInterest = await loanContract.interest.call();
            assert.equal(Number(loanInterest), loanData.interest);
            let loanAmountDue = await loanContract.amountDue.call();
            await contract.payLoan(trust.logs[0].args.trust, {from: accounts[3], value: Number(loanAmountDue)});
            let lender = await trustContract.lender.call();
            assert.equal(lender, utils.zeroAddress);
            activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, utils.zeroAddress);
        });

    });
  });
