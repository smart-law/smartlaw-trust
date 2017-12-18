var SmartDeed = artifacts.require("./SmartDeed.sol");

var chai = require('chai');
var moment = require('moment');
var expect = chai.expect;

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

  describe('newLegalEntity()', () => {
    it("should create new legal entity", () => {
  		return SmartDeedInstance.newLegalEntity(
  				"key",
  				"name"
  			)
  			.then(res => {
  				return SmartDeedInstance.getLegalEntity.call("key");
  			})
  			.then(res => {
          assert.equal(res[0], "name", `${res[0]} is not the name`);
          assert.equal(res[1], false, `${res[1]} is not the verified value`);
  				assert.equal(res[2], accounts[0], `${accounts[2]} is not the address`);
        });
    });
	});

  describe('verifyLegalEntity()', () => {
    it("should return error", () => {
  		return SmartDeedInstance.verifyLegalEntity(
  				"key",
          {
            from: accounts[1]
          }
  			)
  			.catch(err => {
  				assert.isNotNull(err);
  			});
    });
    it("should verify legal entity", () => {
  		return SmartDeedInstance.verifyLegalEntity(
  				"key"
  			)
  			.then(res => {
  				return SmartDeedInstance.getLegalEntity.call("key");
  			})
  			.then(res => {
          assert.equal(res[1], true, `${res[1]} is not the verified value`);
        });
    });
	});

});
