pragma solidity ^0.4.15;

import { EntityFactory } from './EntityFactory.sol';
import { Entity } from './Entity.sol';
import { Trust } from './Trust.sol';
import './Owned.sol';

contract SmartTrustRE is Owned {
  bool public status; // disable or enable contract
  address public entityFactory;

  address[] public trusts;

  event TrustCreated(address trust);

  function SmartTrustRE(address _entityFactory)
      public
      Owned(msg.sender)
  {
      status = true;
      entityFactory = _entityFactory;
  }

  modifier lawActive() {
      require(status);
      _;
  }

  function setEntityFactory(address _address)
      public
      ownerOnly
  {
      entityFactory = _address;
  }

  function trustAddresses()
      public
      lawActive
      constant returns(address[])
  {
      return trusts;
  }

  function updateStatus(bool _disable)
      public
      ownerOnly
  {
      status = _disable;
  }

  function verifyEntity(address _entity)
      public
      lawActive
      ownerOnly
  {
      EntityFactory entityFactoryInstance = EntityFactory(entityFactory);
      require(entityFactoryInstance.isEntity(_entity));
      Entity entity = Entity(_entity);
      entity.verify();
  }

  function newTrust(string _name, string _property, address _beneficiary)
      public
      lawActive
      ownerOnly
  {
      EntityFactory entityFactoryInstance = EntityFactory(entityFactory);
      require(entityFactoryInstance.isEntity(_beneficiary));
      Trust trust = new Trust(_name, _property, _beneficiary);
      trusts.push(trust);
      TrustCreated(trust);
  }

  /**
   * @dev allows entity to withdraw, should be called only from entity contract
   */
  function withdraw()
      public
  {
      EntityFactory entityFactoryInstance = EntityFactory(entityFactory);
      require(entityFactoryInstance.isEntity(msg.sender));
      address _owner = entityFactoryInstance.entityOwner(msg.sender);
      require(_owner != 0x0);
      Entity entity = Entity(msg.sender);
      uint funds = entity.availableFunds();
      if(_owner.send(funds)) {
          entity.sweepFunds();
      }
  }

  function buyTrust(address _trust)
      public
      payable
  {
      EntityFactory entityFactoryInstance = EntityFactory(entityFactory);
      require(entityFactoryInstance.isEntityOwner(msg.sender));
      address _entity = entityFactoryInstance.entityAddress(msg.sender);

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
