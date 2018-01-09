var SmartLawTrust = artifacts.require("./SmartLawTrust.sol");

var chai = require('chai');
var moment = require('moment');
var expect = chai.expect;

contract('SmartLawTrust', accounts => {

	let SmartLawTrustInstance;

	before(() => {
		return SmartLawTrust.deployed()
			.then(instance => {
				SmartLawTrustInstance = instance;
			});
	});

	it("should create new SmartLawTrust contract", () => {
		return SmartLawTrust.deployed().then(instance => {
				return instance.owner.call();
			})
			.then(owner => {
				assert.equal(owner, accounts[0], `${accounts[0]} is not the owner`);
			});
	});

});
