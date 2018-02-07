const Loan = artifacts.require('./Loan.sol');
const SECONDS_PER_DAY = 86400;

contract('Loan', (accounts) => {
    it('verifies the loan after construction', async () => {
        let contract = await Loan.new(
            accounts[1],
            1000000000000000000,
            5,
            5 * SECONDS_PER_DAY,
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
            3 * SECONDS_PER_DAY,
            accounts[2]
        );
        let isDue = await contract.isDue.call();
        assert.equal(isDue, false);
        await contract.makeOverDue(2 * SECONDS_PER_DAY);
        isDue = await contract.isDue.call();
        assert.equal(isDue, false);
    });

});
