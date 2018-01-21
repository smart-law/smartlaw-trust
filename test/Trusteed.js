
const Trusteed = artifacts.require('./Trusteed.sol');
const utils = require('./helpers/Utils');

contract('Trusteed', (accounts) => {
    it('verifies the trustee after construction', async () => {
        let contract = await Trusteed.new(accounts[0]);
        let trustee = await contract.trustee.call();
        assert.equal(trustee, accounts[0]);
    });

    it('verifies the new trustee after trustee transfer', async () => {
        let contract = await Trusteed.new(accounts[0]);
        await contract.transferTrustee(accounts[1]);
        await contract.acceptTrustee({ from: accounts[1] });
        let trustee = await contract.trustee.call();
        assert.equal(trustee, accounts[1]);
    });

    it('verifies that trustee transfer fires an TrusteeUpdate event', async () => {
        let contract = await Trusteed.new(accounts[0]);
        await contract.transferTrustee(accounts[1]);
        let res = await contract.acceptTrustee({ from: accounts[1] });
        assert(res.logs.length > 0 && res.logs[0].event == 'TrusteeUpdate');
    });

    it('verifies that newTrustee is cleared after trustee transfer', async () => {
        let contract = await Trusteed.new(accounts[0]);
        await contract.transferTrustee(accounts[1]);
        await contract.acceptTrustee({ from: accounts[1] });
        let newTrustee = await contract.newTrustee.call();
        assert.equal(newTrustee, utils.zeroAddress);
    });

    it('verifies that no trustee transfer takes places before the new trustee accepted it', async () => {
        let contract = await Trusteed.new(accounts[0]);
        await contract.transferTrustee(accounts[1]);
        let trustee = await contract.trustee.call();
        assert.equal(trustee, accounts[0]);
    });

    it('verifies that only the trustee can initiate trustee transfer', async () => {
        let contract = await Trusteed.new(accounts[0]);

        try {
            await contract.transferTrustee(accounts[1], { from: accounts[2] });
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies that the trustee can cancel management transfer before the new trustee accepted it', async () => {
        let contract = await Trusteed.new(accounts[0]);
        await contract.transferTrustee(accounts[1]);
        await contract.transferTrustee('0x0');
        let newTrustee = await contract.newTrustee.call();
        assert.equal(newTrustee, utils.zeroAddress);
    });
});
