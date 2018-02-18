const Entity = artifacts.require('Entity');

contract('Entity', (accounts) => {

    describe('Entity()', () => {
        it('verifies the entity after construction', async () => {
            let contract = await Entity.new(
                accounts[0], // dexRE
                accounts[1], // liquidRE
                accounts[3], // owner
                1,
                false,
                'PH' // name
            );
            let category = await contract.category.call();
            assert.equal(category, 1);
            let investor = await contract.isAccreditedInvestor.call();
            assert.equal(investor, false);
            let country = await contract.country.call();
            assert.equal(country, 'PH');
        });
    });

});
