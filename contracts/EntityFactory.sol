pragma solidity ^0.4.15;

import { Entity } from './Entity.sol';
import './Owned.sol';

contract EntityFactory is Owned {
  address[] public entities;
  mapping (address => bool) addressesOfEntities;
  mapping (address => address) ownersEntity; // user address => entity address
  mapping (address => address) entityOwners; // entity address => user address

  event EntityCreated(address entity);

  function EntityFactory()
      public
      Owned(msg.sender)
  {
  }

  modifier entityExist(address _address) {
      require(addressesOfEntities[_address]);
      _;
  }

  modifier notEntityOwner(address _address) {
      require(ownersEntity[_address] == 0x0);
      _;
  }

  function entityOwner(address _entity)
      public
      entityExist(_entity)
      view
      returns(address)
  {
      return entityOwners[_entity];
  }

  function entityAddresses()
      public
      view
      returns(address[])
  {
      return entities;
  }

  function isEntity(address _address)
      public
      view returns (bool)
  {
      return addressesOfEntities[_address];
  }

  function isEntityOwner(address _address)
      public
      view returns (bool)
  {
      return ownersEntity[_address] != 0x0;
  }

  function entityAddress(address _owner)
      public
      view returns (address)
  {
      return ownersEntity[_owner];
  }

  function newEntity(address _trustee, uint _category, bool _investor, string _country)
      public
      notEntityOwner(msg.sender)
  {
      Entity entity = new Entity(_trustee, msg.sender, _category, _investor, _country);
      entities.push(entity);
      addressesOfEntities[entity] = true;
      ownersEntity[msg.sender] = entity;
      entityOwners[entity] = msg.sender;
      EntityCreated(entity);
  }

  function transferEntityOwnership(address _entity, address _newOwner)
      public
      entityExist(_entity)
  {
      Entity entity = Entity(_entity);
      entity.transferOwnership(msg.sender, _newOwner);
  }

  function acceptEntityOwnership(address _entity)
      public
      entityExist(_entity)
  {
      Entity entity = Entity(_entity);
      entity.acceptOwnership(msg.sender);
      ownersEntity[msg.sender] = entity;
      delete ownersEntity[entityOwners[entity]];
      entityOwners[entity] = msg.sender;
  }

}
