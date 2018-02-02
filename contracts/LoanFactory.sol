pragma solidity ^0.4.15;

import { Entity } from './Entity.sol';
import { Trust } from './Trust.sol';
import './Owned.sol';

contract LoanFactory is Owned {
  bool public status; // disable or enable contract

  address[] public entities;
  mapping (address => bool) addressesOfEntities;
  mapping (address => address) ownersEntity; // user address => entity address
  mapping (address => address) entityOwners; // entity address => user address

  address[] public trusts;

  event EntityCreated(address entity);
  event TrustCreated(address trust);

  function LoanFactory()
      public
      Owned(msg.sender)
  {
      status = true;
  }

}
