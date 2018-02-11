const Loan = artifacts.require('./Loan.sol');
const utils = require('./helpers/Utils');

contract('Loan', (accounts) => {
    it('verifies the loan after construction', async () => {
        let contract = await Loan.new(
            accounts[1],
            1000000000000000000,
            5,
            5 * utils.SECONDS_PER_DAY,
            accounts[2]
        );
        let trust = await contract.trust.call();
        assert.equal(trust, accounts[1]);
        let amount = await contract.amount.call();
        assert.equal(Number(amount), 1000000000000000000);
        let signatures = await contract.getSignatures.call();
        assert.equal(signatures.length, 1);
        let interest = await contract.interest.call();
        assert.equal(Number(interest), 5);
    });

    it('verifies that loan is not due', async () => {
        let contract = await Loan.new(
            accounts[1],
            1000000000000000000,
            5,
            3 * utils.SECONDS_PER_DAY,
            accounts[2]
        );
        let isDue = await contract.isDue.call();
        assert.equal(isDue, false);
    });

    it('verifies that loan amount due is correct', async () => {
        let data = [
          {
            loanAmount: 1000000000000000000,
            interest: 5
          },
          {
            loanAmount: 500000000000000000,
            interest: 2.5
          },
          {
            loanAmount: 700000000000000000,
            interest: 0.5
          }
        ];

        for(let i=0; i<data.length; i++){
          let contract = await Loan.new(
              accounts[1],
              data[i].loanAmount,
              data[i].interest * 100,
              3 * utils.SECONDS_PER_DAY,
              accounts[2]
          );
          let amountDue = await contract.amountDue.call();
          assert.equal(Number(amountDue), data[i].loanAmount + (data[i].loanAmount * ((data[i].interest * 100)/10000)));
        }
    });

});
