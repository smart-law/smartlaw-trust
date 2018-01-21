
const UnderTrust = artifacts.require('./UnderTrust.sol');
const utils = require('./helpers/Utils');

contract('UnderTrust', (accounts) => {
    it('verifies the trust and status after construction', async () => {
        let contract = await UnderTrust.new(accounts[1], {from: accounts[8]});
        let trust = await contract.trust.call();
        assert.equal(trust, accounts[1]);
        let disabled = await contract.disabled.call();
        assert.equal(disabled, false);
    });

    it('verifies the status after deactivate', async () => {
        let contract = await UnderTrust.new(accounts[1], {from: accounts[8]});
        await contract.deactivate({from: accounts[1]});
        disabled = await contract.disabled.call();
        assert.equal(disabled, true);
    });

    it('verifies that only a trust can initiate deactivate', async () => {
        let contract = await UnderTrust.new(accounts[9], {from: accounts[8]});
        try {
            await contract.deactivate({ from: accounts[2] });
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies status after deactivate', async () => {
        let contract = await UnderTrust.new(accounts[1], {from: accounts[8]});
        await contract.deactivate({from: accounts[1]});
        let status = await contract.disabled.call();
        assert.equal(status, true);
    });

    it('verifies that once disabled, it cannot initiate sign', async () => {
        let contract = await UnderTrust.new(accounts[1], {from: accounts[8]});
        await contract.deactivate({from: accounts[1]});
        try {
            await contract.sign(accounts[1], { from: accounts[1] });
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies that only a trust can initiate sign', async () => {
        let contract = await UnderTrust.new(accounts[1], {from: accounts[8]});
        try {
            await contract.sign(accounts[1], { from: accounts[2] });
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies that it will not duplicate signature', async () => {
        let contract = await UnderTrust.new(accounts[1]);
        await contract.sign(accounts[0], { from: accounts[1] });
        try {
            await contract.sign(accounts[0], { from: accounts[1] });
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('should add signature', async () => {
        let contract = await UnderTrust.new(accounts[1], {from: accounts[8]});
        await contract.sign(accounts[2], { from: accounts[1] });
        await contract.sign(accounts[3], { from: accounts[1] });
        let signatures = await contract.getSignatures.call();
        assert.equal(signatures.length, 2);
    });

});
