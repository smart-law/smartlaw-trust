pragma solidity ^0.4.0;

contract SmartDeed {
  address owner;

  struct LegalEntity {
    unit id;
    string name;
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
    address expense_funds;
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
    uint status;
  }

  struct Payments {
    uint id;
    uint loan;
    uint amount;
    uint conversion_rate;
  }


  function SmartDeed() {
    owner = msg.sender;
  }

  function newLegalEntity(name){
      //insert new legal entity, unverified
      return uint id;
  }

  function verifyLegalEntity(id){
    if (msg.sender != owner) return;
    //update LegalEntity.id >verified = true
    return true;
  }

  function newRealProperty() {
    //insert property, unverified
    return uint id;
  }

  function newDeed(){
      //insert new deed into struct
      return uint id;
  }

  function notarizeDeed() {
    if (msg.sender != owner) return;
    //mark deed as verified
    return true;
  }

  function foreclosure(trust_id) {
    //start auction for trust property
  }

  function transferBeneficialInterest(trust_id,from,to){

  }

  function getTrustInfo(trust_id){

  }

  function getTrustBeneficiaries(trust_id){
    return json;
  }

  function disolveTrust(trust_id){
    if (msg.sender != trust.beneficiary) { throw; }
    //mark trust for disolution

  }

  function startAuction(){

  }

  function bid() payable{
    //let anyone bid on auction.
  }

}
