const Sale = artifacts.require('./Sale.sol');
const utils = require('./helpers/Utils');

contract('Sale', (accounts) => {
    it('verifies the sale after construction', async () => {
        let contract = await Sale.new(accounts[1], 1000000000000000000, accounts[0]);
        let trust = await contract.trust.call();
        assert.equal(trust, accounts[1]);
        let amount = await contract.amount.call();
        assert.equal(Number(amount), 1000000000000000000);
        let signatures = await contract.getSignatures.call();
        assert.equal(signatures.length, 1);
    });
});
