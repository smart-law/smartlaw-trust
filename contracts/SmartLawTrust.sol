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
  mapping (address => LegalEntity) LegalEntities;
  address[] public LegalEntityList;


  struct Trust {
    string name; //name of trust
    string trustProperty; //legal description of property
    bytes32[] beneficiaries; //supports multiple beneficiaries
    mapping (address => bool) dissolveSignatures;
    mapping (address => bool) forSaleSignatures;
    bool exist;
    bool deleted;
    bool forSale;
  }
  mapping (bytes32 => Trust) Trusts;
  bytes32[] public TrustList;

  // Events
  event LegalEntityCreated(address _entity);
  event TrustCreated(bytes32 _trust);

  function SmartDeed() {
    owner = msg.sender;
  }

  modifier owner_only(address _address) {
    require(_address == owner);
    _;
  }

  modifier trust_beneficiary(bytes32 _trust_hash, address _address) {
    require(Trusts[_trust_hash].exist);

    var found = false;
    var beneficiaries = Trusts[_trust_hash].beneficiaries;
    for(var i = 0; i < beneficiaries.length; i++) {
      if(beneficiaries[i]==_address) {
        found = true;
        break;
      }
    }
    require(found);
    _;
  }

  modifier entity_exist(address _address) {
    require(LegalEntities[_address].exist);
    _;
  }

  modifier trust_exist(bytes32 _trust_hash) {
    require(Trusts[_trust_hash].exist);
    _;
  }

  modifier trust_not_deleted(bytes32 _trust_hash) {
    require(Trusts[_trust_hash].deleted == false);
    _;
  }

  function countLegalEntity() public constant returns(uint) {
    return LegalEntityList.length;
  }

  function newLegalEntity(uint _category) {
    var _key = msg.sender;
    var entity = LegalEntities[_key];
    entity.category = _category;
    entity.ownerAddress = msg.sender;
    entity.verified = false;
    entity.exist = true;
    LegalEntityList.push(_key);
    LegalEntityCreated(_key);
  }

  function verifyLegalEntity(address _address) public owner_only(msg.sender) entity_exist(_address) {
    LegalEntities[_address].verified = true;
  }

  function getLegalEntity(address _address) public entity_exist(_address) constant returns (uint, bool, address, bool ) {
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

  function getTrust(bytes32 _trust_hash) public trust_exist(_trust_hash) trust_not_deleted(_key) constant returns (string, string) {
    return (Trusts[_key].name, Trusts[_key].trustProperty);
  }

  function assignBeneficialInterest(bytes32 _trust_hash, address _address) public owner_only(msg.sender) trust_exist(_trust_hash) entity_exist(_address) trust_not_deleted(_trust_hash) {
    Trusts[_trust_hash].beneficiaries.push(_address);
    Trusts[_trust_hash].dissolveSignatures[_address] = false;
    Trusts[_trust_hash].forSaleSignatures[_address] = false;
    /*
    Legal Statement:
    By calling this function, I am assigning all of my rights as beneficiary to the legal entity identified above.
    */
  }

  function dissolveTrust(bytes32 _trust_hash) public  trust_not_deleted(_trust_hash) trust_beneficiary(_trust_hash, msg.sender) {
    Trusts[_trust_hash].dissolveSignatures[msg.sender] = true;

    var beneficiaries = Trusts[_trust_hash].beneficiaries;
    var signatures = Trusts[_trust_hash].dissolveSignatures;

    var trueCount = 0;

    for(var i = 0; i < signatures.length; i++) {
      if(signatures[i]===true) {
        trueCount += 1;
      }
    }
    if(trueCount == beneficiaries.length)
      Trusts[_trust_hash].deleted = true;

    /*
    Legal Statement:
    By calling this function, the beneficiary(ies) request that the trust be dissolved
    and the trust property be deeded to the beneficiary(ies). All beneficiaries must approve to dissolve the trust.
    */
  }

  function offerBeneficialInterestForSale(bytes32 _trust_hash) public  trust_not_deleted(_trust_hash) trust_beneficiary(_trust_hash, msg.sender) {

    Trusts[_trust_hash].forSaleSignatures[msg.sender] = true;

    var beneficiaries = Trusts[_trust_hash].beneficiaries;
    var signatures = Trusts[_trust_hash].forSaleSignatures;

    var trueCount = 0;

    for(var i = 0; i < signatures.length; i++) {
      if(signatures[i]===true) {
        trueCount += 1;
      }
    }
    if(trueCount == beneficiaries.length)
      Trusts[_trust_hash].forSale = true;

    /* Legal Statement:
    By calling this function, the beneficiaries agree to offer their beneficial interest in the trust for sale
    */
  }

  function buyBeneficialInterest(){
    //this lets you buy beneficial interest that is currently offered for forSale
    
  }


  function encrypt(uint _number) public returns (bytes32) {
    return keccak256(_number);
  }

}
