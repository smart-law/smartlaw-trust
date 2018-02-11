const Bid = artifacts.require('./Bid.sol');

contract('Bid', (accounts) => {
    it('verifies the bid after construction', async () => {
        let bid = await Bid.new(
            accounts[1],
            1000000000000000000
        );
        assert.equal(accounts[1], await bid.owner.call());
        assert.equal(1000000000000000000, Number(await bid.amount.call()));
    });
});
