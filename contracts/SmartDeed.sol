pragma solidity ^0.4.0;

contract SmartDeed {
  address public owner;

  struct LegalEntity {
    string name;
    bool verified;
    address ownerAddress;
    bool exist;
  }
  mapping (bytes32 => LegalEntity) LegalEntities;
  bytes32[] public LegalEntityList;

  struct RealProperty {
    string legalDescription;
    string description;
    address expense_funds;
    address ownerAddress;
    bool verified;
    bool exist;
  }
  mapping (bytes32 => RealProperty) RealProperties;
  bytes32[] public RealPropertyList;

  struct Trust {
    string name;
    string legalDescription;
    string status;
    bool verified;
    bytes32 trustor;
    bytes32[] beneficiaries;
    bytes32 property;
    bool exist;
  }
  mapping (bytes32 => Trust) Trusts;
  bytes32[] public TrustList;

  struct Loan {
    bytes32 trust;
    uint amount;
    bool status;
    bool exist;
  }
  mapping (bytes32 => Loan) public Loans;

  struct Payment {
    bytes32 loan;
    uint amount;
    uint conversion_rate;
    bool exist;
  }
  mapping (bytes32 => Payment) public Payments;

  // Events
  event LegalEntityCreated(bytes32 _entity);
  event RealPropertyCreated(bytes32 _property);
  event TrustCreated(bytes32 _trust);

  function SmartDeed() {
    owner = msg.sender;
  }

  modifier owner_only(address _address) {
    require(_address == owner);
    _;
  }

  modifier entity_exist(bytes32 _entity_hash) {
    require(LegalEntities[_entity_hash].exist);
    _;
  }

  modifier property_exist(bytes32 _property_hash) {
    require(RealProperties[_property_hash].exist);
    _;
  }

  modifier trust_exist(bytes32 _trust_hash) {
    require(Trusts[_trust_hash].exist);
    _;
  }

  function countLegalEntity() public constant returns(uint) {
    return LegalEntityList.length;
  }

  function newLegalEntity(string _name) public {
    var _key = keccak256((LegalEntityList.length + 1));
    var entity = LegalEntities[_key];
    entity.name = _name;
    entity.ownerAddress = msg.sender;
    entity.exist = true;
    LegalEntityList.push(_key);
    LegalEntityCreated(_key);
  }

  function verifyLegalEntity(bytes32 _key) public owner_only(msg.sender) entity_exist(_key) {
    LegalEntities[_key].verified = true;
  }

  function getLegalEntity(bytes32 _key) public entity_exist(_key) constant returns (string, bool, address) {
    return (LegalEntities[_key].name, LegalEntities[_key].verified, LegalEntities[_key].ownerAddress);
  }

  function countRealProperty() public constant returns(uint) {
    return RealPropertyList.length;
  }

  function newRealProperty(string _legalDescription, string _description, address _expense_funds) public {
    var _key = keccak256((RealPropertyList.length + 1));
    var property = RealProperties[_key];
    property.legalDescription = _legalDescription;
    property.description = _description;
    property.expense_funds = _expense_funds;
    property.ownerAddress = msg.sender;
    property.exist = true;
    RealPropertyList.push(_key);
    RealPropertyCreated(_key);
  }

  function getRealProperty(bytes32 _key) public constant returns (string, string, address, address, bool) {
    return (
      RealProperties[_key].legalDescription,
      RealProperties[_key].description,
      RealProperties[_key].expense_funds,
      RealProperties[_key].ownerAddress,
      RealProperties[_key].verified
    );
  }

  function verifyRealProperty(bytes32 _key) public owner_only(msg.sender) {
    RealProperties[_key].verified = true;
  }

  function countTrust() public constant returns(uint) {
    return TrustList.length;
  }

  function newTrust(string _name, string _legalDescription, bytes32 _trustor, bytes32 _property) public owner_only(msg.sender) {
    var _key = keccak256((TrustList.length + 1));
    var trust = Trusts[_key];
    trust.name = _name;
    trust.legalDescription = _legalDescription;
    trust.trustor = _trustor;
    trust.property = _property;
    trust.exist = true;
    TrustList.push(_key);
    TrustCreated(_key);
  }

  function setTrustProperty(bytes32 _key, bytes32 _property) public owner_only(msg.sender) {
    var trust = Trusts[_key];
    trust.property = _property;
  }

  function setTrustTrustor(bytes32 _key, bytes32 _trustor) public owner_only(msg.sender) {
    var trust = Trusts[_key];
    trust.trustor = _trustor;
  }

  /* function getTrustTrustor(bytes32 _key, string _trustor) public owner_only(msg.sender) {
    var trust = Trusts[_key];
    trust.trustor = _trustor;
  }

  function getTrustProperty(bytes32 _key, string _trustor) public owner_only(msg.sender) {
    var trust = Trusts[_key];
    trust.trustor = _trustor;
  } */

  function encrypt(uint _number) public returns (bytes32) {
    return keccak256(_number);
  }

}
