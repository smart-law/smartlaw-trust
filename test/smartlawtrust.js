var SmartDeed = artifacts.require("./SmartDeed.sol");

var chai = require('chai');
var moment = require('moment');
var expect = chai.expect;
var web

contract('SmartDeed', accounts => {

	let SmartDeedInstance;

	before(() => {
		return SmartDeed.deployed().then(instance => {
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

	describe('Legal Entity', () => {

		describe('newLegalEntity()', () => {
			it("should create new legal entity", () => {
				return SmartDeedInstance.newLegalEntity(0)
					.then(res => {
						var entityKey = res.logs[0].args._entity;
						return SmartDeedInstance.getLegalEntity.call(entityKey);
					})
					.then(res => {
						assert.equal(res[0], 0, `${res[0]} is wrong category`);
						return SmartDeedInstance.countLegalEntity();
					})
					.then(res => {
						assert.equal(res.toNumber(), 1, `${res} is wrong count`);
					});
			});
		});

		describe('verifyLegalEntity()', () => {
			it("should return error when not owner", () => {
				return SmartDeedInstance.verifyLegalEntity(
						"key", {
							from: accounts[1]
						}
					)
					.catch(err => {
						assert.isNotNull(err);
					});
			});
			it("should return error when key does not exist", () => {
				return SmartDeedInstance.verifyLegalEntity('key')
					.catch(err => {
						assert.isNotNull(err);
					});
			});
			it("should verify legal entity", () => {
				var entityKey = null;
				return SmartDeedInstance.newLegalEntity(1)
					.then(res => {
						entityKey = res.logs[0].args._entity;
						return SmartDeedInstance.verifyLegalEntity(entityKey)
					})
					.then(res => {
						return SmartDeedInstance.getLegalEntity.call(entityKey);
					})
					.then(res => {
						assert.equal(res[1], true, `${res[1]} is not the verified value`);
					});
			});
		});

		describe('getLegalEntity()', () => {
			it("should return error when key does not exist", () => {
				return SmartDeedInstance.getLegalEntity.call('key')
					.catch(err => {
						assert.isNotNull(err);
					});
			});
			it("should return legal entity data", () => {
				var entityKey = null;
				return SmartDeedInstance.newLegalEntity(2)
					.then(res => {
						entityKey = res.logs[0].args._entity;
						return SmartDeedInstance.getLegalEntity.call(entityKey);
					})
					.then(res => {
						assert.equal(res[0], 2, `${res[0]} is not the category`);
						assert.equal(res[2], accounts[0], `${res[0]} is not the category`);
					});
			});
		});

	});

});
