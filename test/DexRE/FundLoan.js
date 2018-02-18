const EntityFactory = artifacts.require('EntityFactory');
const TrusteeFactory = artifacts.require('TrusteeFactory');
const DexRE = artifacts.require('DexRE');
const Entity = artifacts.require('Entity');
const TrustRE = artifacts.require('TrustRE');
const utils = require('../Utils');

contract('DexRE', (accounts) => {
    let loanData = {
        amount: 1000000000000000000,
        interest: 5 * 100,
        due: 3 * utils.SECONDS_PER_DAY
    };

    describe('fundLoan()', () => {
        it('verifies that only entity owner can fund a loan', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let lender = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
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

            try {
                await contract.fundLoan(
                  trust.logs[0].args.trust,
                  {
                    from: accounts[5],
                    value: loanData.amount
                  }
                );
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that only trust with active loan can be funded', async () => {
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
            let buyer = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            try {
                await contract.fundLoan(
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

        it('verifies that funding trust loan failed on amount less than the loan amount', async () => {
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
            let buyer = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});

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
                await contract.fundLoan(trust.logs[0].args.trust, {from: accounts[4], value: loanData.amount / 2});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that entity funded the loan was the lender', async () => {
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
            let buyer = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});

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
            let lender = await trustContract.lender.call();
            assert.equal(lender, buyer.logs[0].args.entity);
        });

        it('verifies that funding trust loan failed when loan was already funded', async () => {
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
            let buyer = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});

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
            let lender = await trustContract.lender.call();
            assert.equal(lender, buyer.logs[0].args.entity);
            try {
                await contract.fundLoan(trust.logs[0].args.trust, {from: accounts[4], value: loanData.amount / 2});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });

        it('verifies that beneficiary will have the total amount of the loan', async () => {
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
            let buyer = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
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
            let entityContract = await Entity.at(entity.logs[0].args.entity);
            let funds = await entityContract.availableFunds.call('DexRE', {from: accounts[3]});
            assert.equal(funds, loanData.amount);
        });

        it('verifies that beneficiaries will have correct amount when the loan amount was equally divided', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let entity2 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            let entity3 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[5]});
            let entity4 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[6]});

            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
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

            let buyer = await entityFactory.newEntity(1, true, 'PH', {from: accounts[8]});
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );
            await trustContract.agreeToLoanProposal(loan.logs[0].args.loan, {from: accounts[4]});
            await trustContract.agreeToLoanProposal(loan.logs[0].args.loan, {from: accounts[5]});
            await trustContract.agreeToLoanProposal(loan.logs[0].args.loan, {from: accounts[6]});

            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, loan.logs[0].args.loan);
            let loanAmount = await trustContract.loanAmount.call();
            assert.equal(Number(loanAmount), loanData.amount);
            await contract.fundLoan(trust.logs[0].args.trust, {from: accounts[8], value: loanData.amount});

            let beneficiaries = [
              { owner:accounts[3], entity: entity.logs[0].args.entity},
              { owner:accounts[4], entity: entity2.logs[0].args.entity},
              { owner:accounts[5], entity: entity3.logs[0].args.entity},
              { owner:accounts[6], entity: entity4.logs[0].args.entity}
            ];

            for(let i = 0; i < beneficiaries.length; i++) {
              let entityContract = await Entity.at(beneficiaries[i].entity);
              let funds = await entityContract.availableFunds.call('DexRE', {from: beneficiaries[i].owner});
              assert.equal(funds, (loanData.amount / beneficiaries.length));
            }
        });

        it('verifies that beneficiaries will have correct amount when the loan amount was equally divided', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            await entityFactory.setDexRE(contract.address);
            await trusteeFactory.setDexRE(contract.address);
            let trustee = await trusteeFactory.newTrustee('Test Trustee', {from: accounts[2]});

            let entity = await entityFactory.newEntity(1, true, 'PH', {from: accounts[3]});
            let entity2 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[4]});
            let entity3 = await entityFactory.newEntity(1, true, 'PH', {from: accounts[5]});

            let trust = await contract.newTrust(trustee.logs[0].args.trustee, 'Test Trust', 'Test Property', entity.logs[0].args.entity, {
                from: accounts[9]
            });
            let trustContract = await TrustRE.at(trust.logs[0].args.trust);

            await trustContract.newBeneficiary(entity2.logs[0].args.entity, {from: accounts[3]});
            let newBeneficiaryRes = await trustContract.newBeneficiary(entity3.logs[0].args.entity, {from: accounts[3]});
            await trustContract.agreeToAddBeneficiary(newBeneficiaryRes.logs[0].args.beneficiary, {from: accounts[4]});

            let beneficiariesCount = await trustContract.beneficiariesCount.call();

            let buyer = await entityFactory.newEntity(1, true, 'PH', {from: accounts[8]});
            let loan = await trustContract.newLoanProposal(
              loanData.amount,
              loanData.interest,
              loanData.due,
              {from: accounts[3]}
            );
            await trustContract.agreeToLoanProposal(loan.logs[0].args.loan, {from: accounts[4]});
            await trustContract.agreeToLoanProposal(loan.logs[0].args.loan, {from: accounts[5]});

            let activeLoan = await trustContract.activeLoan.call();
            assert.equal(activeLoan, loan.logs[0].args.loan);
            let loanAmount = await trustContract.loanAmount.call();
            assert.equal(Number(loanAmount), loanData.amount);
            await contract.fundLoan(trust.logs[0].args.trust, {from: accounts[8], value: loanData.amount});

            let beneficiaries = [
              { owner:accounts[3], entity: entity.logs[0].args.entity},
              { owner:accounts[4], entity: entity2.logs[0].args.entity},
              { owner:accounts[5], entity: entity3.logs[0].args.entity},
            ];

            for(let i = 0; i < beneficiaries.length; i++) {
              let entityContract = await Entity.at(beneficiaries[i].entity);
              let funds = await entityContract.availableFunds.call('DexRE', {from: beneficiaries[i].owner});
              assert.equal(Number(funds), (loanData.amount / beneficiaries.length));
            }
        });

    });
});
