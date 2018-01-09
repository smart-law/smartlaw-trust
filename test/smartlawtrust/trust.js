var SmartLawTrust = artifacts.require("./SmartLawTrust.sol");

var chai = require('chai');
var moment = require('moment');
var expect = chai.expect;

contract('SmartLawTrust', accounts => {

	let SmartLawTrustInstance;
	let TrustKeyTest;
	let EntityKeyTest;
	let TrustOwner = accounts[9];

	before(() => {
		return SmartLawTrust.deployed()
			.then(instance => {
				SmartLawTrustInstance = instance;
				return SmartLawTrustInstance.newLegalEntity(0, false, {
					from: TrustOwner
				})
			})
			.then(res => {
				EntityKeyTest = res.logs[0].args._entity;
				return SmartLawTrustInstance.newTrust('test trust 214', 'test property 214', TrustOwner)
			})
			.then(res => {
				TrustKeyTest = res.logs[0].args._trust;
				return SmartLawTrustInstance.newLegalEntity(0, false, {
					from: accounts[7]
				})
			})
			.then(res => {
				return SmartLawTrustInstance.newLegalEntity(0, false, {
					from: accounts[6]
				})
			})
	});

	describe('Trust', () => {
		it("should return error when sender is not the owner", () => {
			return SmartLawTrustInstance.newTrust('test trust', 'test property', EntityKeyTest)
				.catch(err => {
					assert.isNotNull(err);
				});
		});
		it("should return error when entity does not exist", () => {
			return SmartLawTrustInstance.newTrust('test trust', 'test property', '123')
				.catch(err => {
					assert.isNotNull(err);
				});
		});
		it("should create new trust", () => {
			return SmartLawTrustInstance.newTrust('test trust', 'test property', EntityKeyTest)
				.then(res => {
					var trustKey = res.logs[0].args._trust;
					return SmartLawTrustInstance.getTrust.call(trustKey);
				})
				.then(res => {
					assert.equal(res[0], 'test trust', `${res[0]} is wrong name`);
					assert.equal(res[1], 'test property', `${res[1]} is wrong property`);
				})
		});

		describe('getTrust()', () => {
			it("should return error when key does not exist", () => {
				return SmartLawTrustInstance.getTrust.call('key')
					.catch(err => {
						assert.isNotNull(err);
					});
			});
			it("should return trust data", () => {
				return SmartLawTrustInstance.getTrust.call(TrustKeyTest)
					.then(res => {
						assert.equal(res[0], 'test trust 214', `${res[0]} is wrong name`);
						assert.equal(res[1], 'test property 214', `${res[1]} is wrong property`);
					});
			});
		});

		describe('addBeneficialInterest()', () => {
			it("should return error when key does not exist", () => {
				return SmartLawTrustInstance.addBeneficialInterest.call('key', accounts[0])
					.catch(err => {
						assert.isNotNull(err);
					});
			});
			it("should return error when entity does not exist", () => {
				return SmartLawTrustInstance.addBeneficialInterest(TrustKeyTest, 'key')
					.catch(err => {
						assert.isNotNull(err);
					});
			});
			it("should return error when sender is not beneficiary", () => {
				return SmartLawTrustInstance.addBeneficialInterest(TrustKeyTest, 'key')
					.catch(err => {
						assert.isNotNull(err);
					});
			});
			it("should assign address as beneficiary", () => {
				return SmartLawTrustInstance.addBeneficialInterest(TrustKeyTest, accounts[7], {
						from: TrustOwner
					})
					.then(res => {
						return SmartLawTrustInstance.addBeneficialInterest(TrustKeyTest, accounts[6], {
							from: TrustOwner
						})
					})
					.then(res => {
						return SmartLawTrustInstance.isTrustBeneficiary.call(TrustKeyTest, accounts[7]);
					})
					.then(res => {
						assert.isTrue(res);
						return SmartLawTrustInstance.isTrustBeneficiary.call(TrustKeyTest, accounts[6]);
					})
					.then(res => {
						assert.isFalse(res);
					})
			});

		});

	})
})
