const Bid = artifacts.require('Bid');

contract('Bid', (accounts) => {
    describe('Bid()', () => {
        it('verifies the bid after construction', async () => {
            let bid = await Bid.new(
                accounts[1],
                1000000000000000000
            );
            assert.equal(accounts[1], await bid.owner.call());
            assert.equal(1000000000000000000, Number(await bid.amount.call()));
        });
    });
});
