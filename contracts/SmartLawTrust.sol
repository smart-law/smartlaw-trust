pragma solidity ^0.4.15;

import { Entity } from './Entity.sol';
import { Trust } from './Trust.sol';
import './Owned.sol';

contract SmartLawTrust is Owned {
  bool public status; // disable or enable contract

  address[] public entities;
  mapping (address => bool) addressesOfEntities;
  mapping (address => address) ownersEntity; // user address => entity address
  mapping (address => address) entityOwners; // entity address => user address

  address[] public trusts;

  event EntityCreated(address entity);
  event TrustCreated(address trust);

  function SmartLawTrust()
      public
      Owned(msg.sender)
  {
      status = true;
  }

  modifier lawActive() {
      require(status);
      _;
  }

  modifier entityExist(address _address) {
      require(addressesOfEntities[_address]);
      _;
  }

  modifier notEntityOwner(address _address) {
      require(ownersEntity[_address] == 0x0);
      _;
  }

  function trustAddresses()
      public
      lawActive
      constant returns(address[])
  {
      return trusts;
  }

  function entityAddresses()
      public
      lawActive
      constant returns(address[])
  {
      return entities;
  }

  function updateStatus(bool _disable)
      public
      ownerOnly
  {
      status = _disable;
  }

  function isEntity(address _address)
      public
      constant returns (bool)
  {
      return addressesOfEntities[_address];
  }

  function isEntityOwner(address _address)
      public
      constant returns (bool)
  {
      return ownersEntity[_address] != 0x0;
  }

  function entityAddress(address _owner)
      public
      constant returns (address)
  {
      return ownersEntity[_owner];
  }

  function verifyEntity(address _entity)
      public
      lawActive
      ownerOnly
      entityExist(_entity)
  {
      Entity entity = Entity(_entity);
      entity.verify();
  }

  function newEntity(uint _category, bool _investor)
      public
      lawActive
      notEntityOwner(msg.sender)
  {
      Entity entity = new Entity(msg.sender, _category, _investor);
      entities.push(entity);
      addressesOfEntities[entity] = true;
      ownersEntity[msg.sender] = entity;
      entityOwners[entity] = msg.sender;
      EntityCreated(entity);
  }

  function transferEntityOwnership(address _entity, address _newOwner)
      public
      lawActive
      entityExist(_entity)
  {
      Entity entity = Entity(_entity);
      entity.transferOwnership(msg.sender, _newOwner);
  }

  function acceptEntityOwnership(address _entity)
      public
      lawActive
      entityExist(_entity)
  {
      Entity entity = Entity(_entity);
      entity.acceptOwnership(msg.sender);
      ownersEntity[msg.sender] = entity;
      delete ownersEntity[entityOwners[entity]];
      entityOwners[entity] = msg.sender;
  }

  function newTrust(string _name, string _property, address _beneficiary)
      public
      lawActive
      ownerOnly
      entityExist(_beneficiary)
  {
      Trust trust = new Trust(_name, _property, _beneficiary);
      trusts.push(trust);
      TrustCreated(trust);
  }

  /**
   * @dev allows entity to withdraw, should be called only from entity contract
   */
  function withdraw()
      public
      entityExist(msg.sender)
  {
      require(entityOwners[msg.sender] != 0x0);
      Entity entity = Entity(msg.sender);
      uint funds = entity.availableFunds();
      if(entityOwners[msg.sender].send(funds)) {
          entity.sweepFunds();
      }
  }

  function buyTrust(address _trust)
      public
      payable
  {
      require(isEntityOwner(msg.sender));
      address _entity = entityAddress(msg.sender);

      Trust trust = Trust(_trust);
      require(trust.forSale());

      uint amount = trust.forSaleAmount();
      require(msg.value >= amount);
      uint beneficiariesCount = trust.beneficiariesCount();

      uint refund = msg.value - amount;
      if(refund > 0) {
          msg.sender.transfer(refund);
      }

      uint share = amount / beneficiariesCount;
      for(uint i = 0; i < beneficiariesCount; i++) {
          address beneficiary = trust.getBeneficiaryByIndex(i);
          Entity entity = Entity(beneficiary);
          entity.deposit(share);
      }
      trust.sold(_entity);
  }

}
