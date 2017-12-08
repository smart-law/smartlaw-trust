pragma solidity ^0.4.0;

contract SmartDeed {
  address owner;

  struct Property {
    uint id;
    string legalDescription;
    string description;
    bool borrowerPaid;
  }
  struct Deed {
    unit id;
    unit currentOwner;
    unit newOwner;
  }

  function SmartDeed() {
    owner = msg.sender;
  }

  function newProperty() {
    //to do
  }

  function notarizeDeed() {
    if (msg.sender != owner) return;
    //to do
  }

  function forclosure() {
    //to do
  }

}
