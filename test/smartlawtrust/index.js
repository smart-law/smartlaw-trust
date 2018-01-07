var SmartDeed = artifacts.require("./SmartDeed.sol");

var chai = require('chai');
var moment = require('moment');
var expect = chai.expect;

contract('SmartDeed', accounts => {

	let SmartDeedInstance;

	before(() => {
		return SmartDeed.deployed()
			.then(instance => {
				SmartDeedInstance = instance;
			});
	});

	it("should create new SmartDeed contract", () => {
		return SmartDeed.deployed().then(instance => {
				return instance.owner.call();
			})
			.then(owner => {
				assert.equal(owner, accounts[0], `${accounts[0]} is not the owner`);
			});
	});

});
