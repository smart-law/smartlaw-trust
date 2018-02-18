const DexRE = artifacts.require('DexRE');
const EntityFactory = artifacts.require('EntityFactory');
const TrusteeFactory = artifacts.require('TrusteeFactory');

contract('DexRE', (accounts) => {
    describe('DexRE()', () => {
        it('verifies the DexRE after construction', async () => {
            let entityFactory = await EntityFactory.new();
            let trusteeFactory = await TrusteeFactory.new();
            let contract = await DexRE.new(entityFactory.address, trusteeFactory.address);
            let owner = await contract.owner.call();
            assert.equal(owner, accounts[0]);
            let status = await contract.status.call();
            assert.equal(status, true);
        });
    });
});
