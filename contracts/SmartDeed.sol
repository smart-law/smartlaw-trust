pragma solidity ^0.4.0;

contract SmartDeed {
  address public owner;

  struct LegalEntity {
    string name;
    bool verified;
    address ownerAddress;
  }
  mapping (bytes32 => LegalEntity) LegalEntities;
  bytes32[] public LegalEntityList;

  struct Trust {
    string name;
    string status;
    address ownerAddress;
  }
  mapping (bytes32 => Trust) Trusts;

  struct RealProperty {
    string legalDescription;
    string description;
    address expense_funds;
    address ownerAddress;
    bool verified;
  }
  mapping (bytes32 => RealProperty) RealProperties;
  bytes32[] public RealPropertyList;

  struct Deed {
    bytes32 trust;
    bool verified;
  }
  mapping (bytes32 => Deed) public Deeds;

  struct Beneficiary {
    bytes32 entity;
    bytes32 trust;
  }
  mapping (bytes32 => Beneficiary) public Beneficiaries;

  struct Loan {
    bytes32 trust;
    uint amount;
    bool status;
  }
  mapping (bytes32 => Loan) public Loans;

  struct Payment {
    bytes32 loan;
    uint amount;
    uint conversion_rate;
  }
  mapping (bytes32 => Payment) public Payments;


  function SmartDeed() {
    owner = msg.sender;
  }

  modifier owner_only(address _address) {
    require(_address == owner);
    _;
  }

  function newLegalEntity(bytes32 _key, string _name) public {
    var entity = LegalEntities[_key];
    entity.name = _name;
    entity.ownerAddress = msg.sender;
    LegalEntityList.push(_key);
  }

  function verifyLegalEntity(bytes32 _key) public owner_only(msg.sender) returns(bool) {
    LegalEntities[_key].verified = true;
    return true;
  }

  function getLegalEntity(bytes32 _key) public returns (string, bool, address) {
    return (LegalEntities[_key].name, LegalEntities[_key].verified, LegalEntities[_key].ownerAddress);
  }

  function newRealProperty(bytes32 _key, string _legalDescription, string _description, address _expense_funds) {
    var property = RealProperties[_key];
    property.legalDescription = _legalDescription;
    property.description = _description;
    property.expense_funds = _expense_funds;
    property.ownerAddress = msg.sender;
    RealPropertyList.push(_key);
  }

  function verifyRealProperty(bytes32 _key) public owner_only(msg.sender) returns(bool) {
    RealProperties[_key].verified = true;
    return true;
  }

  /* function newDeed(property_id){
      //insert new deed into struct
      //return uint id;
  }

  function notarizeDeed(deed_id) {
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
    //if (msg.sender != trust.beneficiary) { throw; }
    //mark trust for disolution

  }

  function startAuction(){

  }

  function bid() payable{
    //let anyone bid on auction.
  } */

}
