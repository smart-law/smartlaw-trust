var SmartLawTrust = artifacts.require("./SmartLawTrust.sol");

var chai = require('chai');
var moment = require('moment');
var expect = chai.expect;

contract('SmartLawTrust', accounts => {

	let SmartLawTrustInstance;
	let EntityKeyTest;

	before(() => {
		return SmartLawTrust.deployed()
			.then(instance => {
				SmartLawTrustInstance = instance;
				return SmartLawTrustInstance.newLegalEntity(0, false)
			})
			.then(res => {
				EntityKeyTest = res.logs[0].args._entity;
			});
	});

	describe('Legal Entity', () => {

		describe('newLegalEntity()', () => {
			it("should return error when sender is already an entity", () => {
				return SmartLawTrustInstance.newLegalEntity(0, false)
					.catch(err => {
						assert.isNotNull(err);
					});
			});
			it("should create new legal entity", () => {
				return SmartLawTrustInstance.newLegalEntity(0, false, {from: accounts[1]})
					.then(res => {
						var entityKey = res.logs[0].args._entity;
						return SmartLawTrustInstance.getLegalEntity.call(entityKey);
					})
					.then(res => {
						assert.equal(res[0], 0, `${res[0]} is wrong category`);
						return SmartLawTrustInstance.countLegalEntity();
					})
					.then(res => {
						assert.equal(res.toNumber(), 2, `${res} is wrong count`);
					});
			});
		});

		describe('verifyLegalEntity()', () => {
			it("should return error when not owner", () => {
				return SmartLawTrustInstance.verifyLegalEntity(
						"key", {
							from: accounts[1]
						}
					)
					.catch(err => {
						assert.isNotNull(err);
					});
			});
			it("should return error when key does not exist", () => {
				return SmartLawTrustInstance.verifyLegalEntity('key')
					.catch(err => {
						assert.isNotNull(err);
					});
			});
			it("should verify legal entity", () => {
				return SmartLawTrustInstance.verifyLegalEntity(EntityKeyTest)
					.then(res => {
						return SmartLawTrustInstance.getLegalEntity.call(EntityKeyTest);
					})
					.then(res => {
						assert.equal(res[1], true, `${res[1]} is not the verified value`);
					});
			});
		});

		describe('getLegalEntity()', () => {
			it("should return error when key does not exist", () => {
				return SmartLawTrustInstance.getLegalEntity.call('key')
					.catch(err => {
						assert.isNotNull(err);
					});
			});
			it("should return legal entity data", () => {
				return SmartLawTrustInstance.getLegalEntity.call(EntityKeyTest)
					.then(res => {
						assert.equal(res[0].toNumber(), 0, `${res[0]} is not the category`);
						assert.equal(res[2], accounts[0], `${res[0]} is not the owner`);
					});
			});
		});

		describe('countLegalEntity()', () => {
			it("should return correct number of entity", () => {
				return SmartLawTrustInstance.countLegalEntity.call()
					.then(res => {
						assert.equal(res.toNumber(), 2, `${res.toNumber()} is not the correct count`);
					})
			})
		});

	});

});
