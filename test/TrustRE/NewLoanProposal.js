const TrustRE = artifacts.require('./TrustRE.sol');
const EntityFactory = artifacts.require('./EntityFactory.sol');
const SmartTrustRE = artifacts.require('./SmartTrustRE.sol');
const utils = require('../helpers/Utils');

contract('TrustRE', (accounts) => {
    let loanData = {
        amount: 1000000000000000000,
        interest: 5 * 100,
        due: 3 * utils.SECONDS_PER_DAY
    };

    describe('newLoanProposal()', () => {
        it('verifies that only existing trust beneficiary can add loan proposal', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);

            try {
                await trustContract.newLoanProposal(10, 5, 20, {from: accounts[2]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that trust has active loan', async () => {
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
            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, loan.logs[0].args.loan);
            let loanAmount = await trustContract.loanAmount.call();
            assert.equal(Number(loanAmount), loanData.amount);
            let proposals = await trustContract.loanProposals.call();
            assert.equal(proposals.length, 0);
        });

        it('verifies that new loan proposal fires a LoanProposalAdded event', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let beneficiaryEntity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            await trustContract.newBeneficiary(beneficiaryEntity.logs[0].args.entity, {from: accounts[3]});
            let res = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );
            assert(res.logs.length > 0 && res.logs[0].event == 'LoanProposalAdded');
        });

        it('verifies that loan proposal was added', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);

            let beneficiaryEntity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[4]});
            await trustContract.newBeneficiary(beneficiaryEntity.logs[0].args.entity, {from: accounts[3]});

            await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );

            await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );

            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, utils.zeroAddress);
            let loanAmount = await trustContract.loanAmount.call();
            assert.equal(Number(loanAmount), 0);
            let loanAmountDue = await trustContract.loanAmountDue.call();
            assert.equal(Number(loanAmountDue), 0);
            let proposals = await trustContract.loanProposals.call();
            assert.equal(proposals.length, 2);
        });

        it('verifies that only trust that does not have active loan can accept loan proposal', async () => {
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
            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, loan.logs[0].args.loan);

            try {
                await trustContract.newLoanProposal(
                  loanData.amount,
                  loanData.interest,
                  loanData.due,
                  {from: accounts[3]}
                );
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that only trust not for sale can accept loan proposal', async () => {
            let entityFactory = await EntityFactory.new();
            let contract = await SmartTrustRE.new(entityFactory.address, {from: accounts[9]});

            let entity = await entityFactory.newEntity(contract.address, 1, true, 'PH', {from: accounts[3]});
            let trust = await contract.newTrust('Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);
            await trustContract.newSaleOffer(10, {from: accounts[3]});

            try {
                await trustContract.newLoanProposal(
                  loanData.amount,
                  loanData.interest,
                  loanData.due,
                  {from: accounts[3]}
                );
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

      });
});
