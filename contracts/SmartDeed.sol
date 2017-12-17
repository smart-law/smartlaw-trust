pragma solidity ^0.4.0;

contract SmartDeed {
  address owner;

  struct LegalEntity {
    unit id;
    unit name;
    unit verified;
  }
  struct Trust {
    uint id;
    string status;
  }
  struct RealProperty {
    uint id;
    string legalDescription;
    string description;
  }
  struct Deed {
    unit id;
    unit trust;
    unit verified;
  }
  struct Beneficiary {
    unit id;
    unit LegalEntity;
    unit Trust;
  }
  struct Loan {
    uint id;
    uint trust;
    uint amount;
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
