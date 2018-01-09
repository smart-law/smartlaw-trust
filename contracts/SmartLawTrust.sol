pragma solidity ^0.4.15;

contract SmartLawTrust {
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

    struct Sale {
        uint amount;
        address[] signatures;
    }

    struct Trust {
        string name; //name of trust
        string trustProperty; //legal description of property
        address[] beneficiaries; //supports multiple beneficiaries
        mapping (bytes32 => Sale) saleOptions;
        bytes32[] saleList;
        address[] dissolve;
        bool exist;
        uint safetyDelay; //safety delay to allow for freeze in event of security breach
        bool deleted;
        bool forSale;
        uint forSaleAmount;
    }
    mapping (bytes32 => Trust) Trusts;
    bytes32[] public TrustList;

    // Events
    event LegalEntityCreated(address _entity);
    event TrustCreated(bytes32 _trust);

    function SmartLawTrust() public {
        owner = msg.sender;
    }

    modifier owner_only(address _address) {
        require(_address == owner);
        _;
    }

    function is_beneficiary(bytes32 _trust_hash, address _address) private returns (bool) {
        var beneficiaries = Trusts[_trust_hash].beneficiaries;
        for (uint i = 0; i < beneficiaries.length; i++) {
            if (beneficiaries[i] == _address) {
                return true;
            }
        }
        
        return false;
    }

    modifier trust_beneficiary(bytes32 _trust_hash, address _address) {
        require(Trusts[_trust_hash].exist);
        require(is_beneficiary(_trust_hash, _address));
        _;
    }

    modifier entity_exist(address _address) {
        require(LegalEntities[_address].exist);
        _;
    }

    modifier entity_does_not_exist(address _address) {
        require(!LegalEntities[_address].exist);
        _;
    }

    modifier trust_exist(bytes32 _trust_hash) {
        require(Trusts[_trust_hash].exist);
        _;
    }

    modifier trust_not_deleted(bytes32 _trust_hash) {
        require(!Trusts[_trust_hash].deleted);
        _;
    }

    modifier trust_not_for_sale(bytes32 _trust_hash) {
        require(!Trusts[_trust_hash].forSale);
        _;
    }

    modifier trust_for_sale(bytes32 _trust_hash) {
        require(Trusts[_trust_hash].forSale == true);
        _;
    }

    function countLegalEntity() public constant returns(uint) {
        return LegalEntityList.length;
    }

    function newLegalEntity(uint _category, bool _accreditedInvestor)
        public
        entity_does_not_exist(msg.sender)
    {

        address _key = msg.sender;
        var entity = LegalEntities[_key];
        entity.category = _category;
        entity.accreditedInvestor = _accreditedInvestor;
        entity.ownerAddress = msg.sender;
        entity.verified = false;
        entity.exist = true;
        LegalEntityList.push(_key);
        LegalEntityCreated(_key);
    }

    function verifyLegalEntity(address _address)
        public
        owner_only(msg.sender)
        entity_exist(_address)
    {
        LegalEntities[_address].verified = true;
    }

    function getLegalEntity(address _address)
        public
        entity_exist(_address)
        constant returns (uint, bool, address, bool )
    {
        return (LegalEntities[_address].category, LegalEntities[_address].verified, LegalEntities[_address].ownerAddress, LegalEntities[_address].accreditedInvestor);
    }

    function countTrust() public constant returns(uint) {
        return TrustList.length;
    }

    function newTrust(string _name, string _trustProperty, address _beneficiary)
        public
        owner_only(msg.sender)
        entity_exist(_beneficiary)
    {
        var _key = keccak256((TrustList.length + 1));
        var trust = Trusts[_key];
        trust.name = _name;
        trust.trustProperty = _trustProperty;
        trust.deleted = false;
        trust.forSale = false;
        trust.forSaleAmount = 0;
        trust.exist = true;
        trust.beneficiaries.push(_beneficiary);
        TrustList.push(_key);
        TrustCreated(_key);
    }

    function isTrustBeneficiary(bytes32 _trust_hash, address _address)
        public
        trust_not_deleted(_trust_hash)
        constant returns (bool)
    {
        return is_beneficiary(_trust_hash, _address);
    }

    function getTrust(bytes32 _trust_hash)
        public
        trust_exist(_trust_hash)
        trust_not_deleted(_trust_hash)
        constant returns (string, string, bool, uint, bool)
    {
        return (
            Trusts[_trust_hash].name,
            Trusts[_trust_hash].trustProperty,
            Trusts[_trust_hash].forSale,
            Trusts[_trust_hash].forSaleAmount,
            Trusts[_trust_hash].deleted
            );
    }

    function getTrustBeneficiaries(bytes32 _trust_hash)
        public
        trust_exist(_trust_hash)
        trust_not_deleted(_trust_hash)
        constant returns (address[])
    {
        return Trusts[_trust_hash].beneficiaries;
    }

    function getTrustDissolveSignatures(bytes32 _trust_hash)
        public
        trust_exist(_trust_hash)
        trust_not_deleted(_trust_hash)
        constant returns (address[])
    {
        return Trusts[_trust_hash].dissolve;
    }

    function getTrustSaleOffers(bytes32 _trust_hash)
        public
        trust_exist(_trust_hash)
        trust_not_deleted(_trust_hash)
        constant returns (bytes32[])
    {
        return Trusts[_trust_hash].saleList;
    }

    function assignBeneficialInterest(bytes32 _trust_hash, address _address)
        public
        trust_beneficiary(_trust_hash, msg.sender)
        trust_exist(_trust_hash)
        entity_exist(_address)
        trust_not_deleted(_trust_hash)
    {
        Trusts[_trust_hash].beneficiaries.push(_address);
        /*
        Legal Statement:
        By calling this function, I am assigning all of my rights as beneficiary to the legal entity identified above.
        */
    }

    function getTrustSaleOfferDetail(bytes32 _trust_hash, bytes32 _sale_hash)
        public
        trust_exist(_trust_hash)
        trust_not_deleted(_trust_hash)
        constant returns(uint, address[])
    {
        return (
            Trusts[_trust_hash].saleOptions[_sale_hash].amount,
            Trusts[_trust_hash].saleOptions[_sale_hash].signatures
        );
    }

    function dissolveTrust(bytes32 _trust_hash)
        public
        trust_not_deleted(_trust_hash)
        trust_not_for_sale(_trust_hash)
        trust_beneficiary(_trust_hash, msg.sender)
    {
        var signatures = Trusts[_trust_hash].dissolve;

        for (uint i = 0; i < signatures.length; i++) {
            if (signatures[i]==msg.sender) {
                revert(); // Already agreed to dissolve
            }
        }

        var beneficiaries = Trusts[_trust_hash].beneficiaries;

        Trusts[_trust_hash].dissolve.push(msg.sender);
        if (Trusts[_trust_hash].dissolve.length == beneficiaries.length) {
            Trusts[_trust_hash].deleted = true;
        }
    }

    function agreeSaleOffer(bytes32 _trust_hash, bytes32 _sale_hash)
        public
        trust_not_deleted(_trust_hash)
        trust_not_for_sale(_trust_hash)
        trust_beneficiary(_trust_hash, msg.sender)
    {
        var signatures = Trusts[_trust_hash].saleOptions[_sale_hash].signatures;

        for (uint i = 0; i < signatures.length; i++) {
            if (signatures[i]==msg.sender) {
                revert(); // Already agreed to sale offer
            }
        }

        var beneficiaries = Trusts[_trust_hash].beneficiaries;

        Trusts[_trust_hash].saleOptions[_sale_hash].signatures.push(msg.sender);
        if (beneficiaries.length == Trusts[_trust_hash].saleOptions[_sale_hash].signatures.length) {
            Trusts[_trust_hash].forSale = true;
            Trusts[_trust_hash].forSaleAmount = Trusts[_trust_hash].saleOptions[_sale_hash].amount;
        }
    }

    function offerBeneficialInterestForSale(bytes32 _trust_hash, uint _amount)
        public
        trust_not_deleted(_trust_hash)
        trust_not_for_sale(_trust_hash)
        trust_beneficiary(_trust_hash, msg.sender)
    {
        var _key = keccak256((Trusts[_trust_hash].saleList.length + 1));

        Trusts[_trust_hash].saleOptions[_key].amount = _amount;
        Trusts[_trust_hash].saleOptions[_key].signatures.push(msg.sender);
        Trusts[_trust_hash].saleList.push(_key);

        /* Legal Statement:
        By calling this function, the beneficiaries agree to offer their beneficial interest in the trust for sale
        */
    }

    function buyBeneficialInterest(bytes32 _trust_hash)
        public
        payable
        trust_not_deleted(_trust_hash)
        trust_for_sale(_trust_hash)
    {
        //this lets you buy beneficial interest that is currently offered for forSale

        require(msg.value >= Trusts[_trust_hash].forSaleAmount);

        uint i;
        uint refund = msg.value - Trusts[_trust_hash].forSaleAmount;
        if (refund > 0) {
            msg.sender.transfer(refund);
        }

        uint beneficiaryAmount = Trusts[_trust_hash].forSaleAmount / Trusts[_trust_hash].beneficiaries.length;
        for (i = 0; i < Trusts[_trust_hash].beneficiaries.length; i++) {
            Trusts[_trust_hash].beneficiaries[i].transfer(beneficiaryAmount);
        }

        bytes32[] memory emptyBytes32Array;
        address[] memory emptyAddressArray;

        Trusts[_trust_hash].dissolve = emptyAddressArray;

        uint length = Trusts[_trust_hash].saleList.length;
        for (i = 0; i < length; i++) {
            delete Trusts[_trust_hash].saleOptions[Trusts[_trust_hash].saleList[i]];
        }

        Trusts[_trust_hash].saleList = emptyBytes32Array;
        Trusts[_trust_hash].beneficiaries = emptyAddressArray;
        Trusts[_trust_hash].beneficiaries.push(msg.sender);

        Trusts[_trust_hash].forSale = false;
        Trusts[_trust_hash].forSaleAmount = 0;
    }

}
