pragma solidity ^0.4.0;

contract SmartDeed {
  address public owner;

  struct LegalEntity {
    uint category; //0 = individual, 1=llc, 2=c corp, 3=s corp, 4=llp, 5=trust
    address ownerAddress; //ethereum address of legal entity
    bool accreditedInvestor; //0=no, 1=yes
    bool verified;
    bool exist;
  }
  mapping (bytes32 => LegalEntity) LegalEntities;
  bytes32[] public LegalEntityList;


  struct Trust {
    string name; //name of trust
    string trustProperty; //legal description of property
    bytes32[] beneficiaries; //supports multiple beneficiaries
    address[] dissolvedSignatures;
    bool exist;
    bool deleted;
  }
  mapping (bytes32 => Trust) Trusts;
  bytes32[] public TrustList;

  // Events
  event LegalEntityCreated(bytes32 _entity);
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

  modifier trust_exist(bytes32 _trust_hash) {
    require(Trusts[_trust_hash].exist);
    _;
  }

  function countLegalEntity() public constant returns(uint) {
    return LegalEntityList.length;
  }

  function newLegalEntity(uint _category) {
    var _key = keccak256((LegalEntityList.length + 1));
    var entity = LegalEntities[_key];
    entity.category = _category;
    entity.ownerAddress = msg.sender;
    entity.verified = false;
    entity.exist = true;
    LegalEntityList.push(_key);
    LegalEntityCreated(_key);
  }

  function verifyLegalEntity(bytes32 _key) public owner_only(msg.sender) entity_exist(_key) {
    LegalEntities[_key].verified = true;
  }

  function getLegalEntity(bytes32 _key) public entity_exist(_key) constant returns (uint, bool, address, bool ) {
    return (LegalEntities[_key].category, LegalEntities[_key].verified, LegalEntities[_key].ownerAddress, LegalEntities[_key].accreditedInvestor);
  }

  function countTrust() public constant returns(uint) {
    return TrustList.length;
  }

  function newTrust(string _name, string _trustProperty) public owner_only(msg.sender) {
    var _key = keccak256((TrustList.length + 1));
    var trust = Trusts[_key];
    trust.name = _name;
    trust.trustProperty = _trustProperty;
    trust.deleted = false;
    trust.exist = true;
    TrustList.push(_key);
    TrustCreated(_key);
  }


  function getTrustBeneficiaries(){
    //return list of beneficiaries
  }

  function getTrust(bytes32 _key) public trust_exist(_key) constant returns (string, string) {
    return (Trusts[_key].name, Trusts[_key].trustProperty);
  }

  function assignBeneficialInterest(bytes32 _trust_hash, bytes32 _entity_hash) public owner_only(msg.sender) trust_exist(_trust_hash) entity_exist(_entity_hash) {
    Trusts[_trust_hash].beneficiaries.push(_entity_hash);
    /*
    Legal Statement:
    By calling this function, I am assigning all of my rights as beneficiary to the legal entity identified above.
    */
  }

  function dissolveTrust(){
    /*
    Legal Statement:
    By calling this function, the beneficiary(ies) request that the trust be dissolved
    and the trust property be deeded to the beneficiary(ies)
    */
  }



  function encrypt(uint _number) public returns (bytes32) {
    return keccak256(_number);
  }

}
