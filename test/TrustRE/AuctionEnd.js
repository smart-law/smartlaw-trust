const TrustRE = artifacts.require('TrustRE');
const TrusteeFactory = artifacts.require('TrusteeFactory');
const EntityFactory = artifacts.require('EntityFactory');
const DexRE = artifacts.require('DexRE');
const Loan = artifacts.require('Loan');
const utils = require('../Utils');

contract('TrustRE', (accounts) => {
    let loanData = {
        amount: 1000000000000000000,
        interest: 5 * 100,
        due: 3 * utils.SECONDS_PER_DAY
    };

    describe('auctionEnd()', () => {

        it('verifies that auction will not stop until auction end date(14 days after loan due)', async () => {
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
                await trustContract.auctionEnd();
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that lender becomes the new trust beneficiary)', async () => {
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
            let lender = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
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
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let lender = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
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
