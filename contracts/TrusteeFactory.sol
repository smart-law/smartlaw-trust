pragma solidity ^0.4.4;

import { Trustee } from './Trustee.sol';
import './Owned.sol';

contract TrusteeFactory is Owned {
  address[] public trustees;
  mapping (address => bool) addressesOfTrustees;
  mapping (address => address) ownersTrustee; // user address => trustee address
  mapping (address => address) trusteeOwners; // trustee address => user address
  address public dexRE;
  address public liquidRE;

  event TrusteeCreated(address trustee);

  function TrusteeFactory()
      public
      Owned(msg.sender)
  {

  }

  modifier trusteeExist(address _address) {
      require(addressesOfTrustees[_address]);
      _;
  }

  modifier notTrusteeOwner(address _address) {
      require(ownersTrustee[_address] == 0x0);
      _;
  }

  function setDexRE(address _address)
      public
      ownerOnly
  {
      dexRE = _address;
  }

  function setLiquidRE(address _address)
      public
      ownerOnly
  {
      liquidRE = _address;
  }

  function trusteeOwner(address _trustee)
      public
      trusteeExist(_trustee)
      view
      returns(address)
  {
      return trusteeOwners[_trustee];
  }

  function trusteeAddresses()
      public
      view
      returns(address[])
  {
      return trustees;
  }

  function isTrustee(address _address)
      public
      view returns (bool)
  {
      return addressesOfTrustees[_address];
  }

  function isTrusteeOwner(address _address)
      public
      view returns (bool)
  {
      return ownersTrustee[_address] != 0x0;
  }

  function trusteeAddress(address _owner)
      public
      view returns (address)
  {
      return ownersTrustee[_owner];
  }

  function newTrustee(string _name)
      public
      notTrusteeOwner(msg.sender)
  {
      Trustee trustee = new Trustee(dexRE, liquidRE, msg.sender, _name);
      trustees.push(trustee);
      addressesOfTrustees[trustee] = true;
      ownersTrustee[msg.sender] = trustee;
      trusteeOwners[trustee] = msg.sender;
      TrusteeCreated(trustee);
  }

  function transferTrusteeOwnership(address _trustee, address _newOwner)
      public
      trusteeExist(_trustee)
  {
      Trustee trustee = Trustee(_trustee);
      trustee.transferOwnership(msg.sender, _newOwner);
  }

  function acceptTrusteeOwnership(address _trustee)
      public
      trusteeExist(_trustee)
  {
      Trustee trustee = Trustee(_trustee);
      trustee.acceptOwnership(msg.sender);
      ownersTrustee[msg.sender] = trustee;
      delete ownersTrustee[trusteeOwners[trustee]];
      trusteeOwners[trustee] = msg.sender;
  }

}
