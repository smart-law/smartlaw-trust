const TrustRE = artifacts.require('TrustRE');
const TrusteeFactory = artifacts.require('TrusteeFactory');
const EntityFactory = artifacts.require('EntityFactory');
const DexRE = artifacts.require('DexRE');
const Loan = artifacts.require('Loan');
const utils = require('../Utils');

contract('TrustRE', (accounts) => {
    let loanData = {
        amount: 1000000000000000000,
        interest: 5 * 100,
        due: 3 * utils.SECONDS_PER_DAY
    };

    describe('funded()', () => {
        it('verifies that only DexRE can initiate funded', async () => {
            let contract = await TrustRE.new(accounts[3], 'Test Trust', 'Test Property', accounts[0], {from: accounts[9]});

            try {
                await contract.funded(accounts[1], {from: accounts[2]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });
        it('verifies that only trust with active loan can be funded', async () => {
            let contract = await TrustRE.new(accounts[9], 'Test Trust', 'Test Property', accounts[0], {from: accounts[9]});

            try {
                await contract.funded(accounts[1], {from: accounts[9]});
                assert(false, "didn't throw");
            }
            catch (error) {
                return utils.ensureException(error);
            }
        });
    });
});
