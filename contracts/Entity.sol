pragma solidity ^0.4.15;
import './Trusteed.sol';
import { SmartTrustRE } from './SmartTrustRE.sol';

contract Entity is Trusteed {
    address public factory;

    address public owner;
    address public newOwner;

    uint funds; // wei

    uint public category;
    bool public isAccreditedInvestor;
    bool public verified;
    string public country;

    function Entity(
        address _trustee,
        address _owner,
        uint _category,
        bool _investor,
        string _country
      )
        public
        Trusteed(_trustee)
    {
        owner = _owner;
        category = _category;
        isAccreditedInvestor = _investor;
        country = _country;
        verified = false;
        funds = 0;
        factory = msg.sender;
    }

    modifier ownerOnly(address _address) {
        require(_address == owner);
        _;
    }

    modifier factoryOnly() {
        require(factory == msg.sender);
        _;
    }

    modifier validateSender() {
        require(msg.sender == owner || msg.sender == trustee);
        _;
    }

    function() public payable {
      funds += msg.value;
    }

    function verify()
        public
        trusteeOnly(msg.sender)
    {
        verified = true;
    }

    function transferOwnership(address _sender, address _newOwner)
        public
        ownerOnly(_sender)
        factoryOnly
    {
        require(_newOwner != owner);
        newOwner = _newOwner;
    }

    function acceptOwnership(address _sender)
        public
        factoryOnly
    {
        require(_sender == newOwner);
        owner = newOwner;
        newOwner = 0x0;
    }

    function withdraw()
        public
        ownerOnly(msg.sender)
    {
        SmartTrustRE smartLaw = SmartTrustRE(trustee);
        smartLaw.withdraw();
    }

    function deposit(uint _amount)
        public
        trusteeOnly(msg.sender)
    {
        funds += _amount;
    }

    function sweepFunds()
        public
        trusteeOnly(msg.sender)
    {
        funds = 0;
    }

    function availableFunds()
        public
        validateSender
        constant returns(uint)
    {
        return funds;
    }

}
