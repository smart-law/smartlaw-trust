pragma solidity ^0.4.15;
import './Trusteed.sol';
import { SmartLawTrust } from './SmartLawTrust.sol';

contract Entity is Trusteed {
    address public owner;
    address public newOwner;

    uint funds; // wei

    uint public category;
    bool public isAccreditedInvestor;
    bool public verified;

    function Entity(
        address _owner,
        uint _category,
        bool _investor
      )
        public
        Trusteed(msg.sender)
    {
        owner = _owner;
        category = _category;
        isAccreditedInvestor = _investor;
        verified = false;
        funds = 0;
    }

    modifier ownerOnly(address _address) {
        require(_address == owner);
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
        trusteeOnly(msg.sender)
    {
        require(_newOwner != owner);
        newOwner = _newOwner;
    }

    function acceptOwnership(address _sender)
        public
        trusteeOnly(msg.sender)
    {
        require(_sender == newOwner);
        owner = newOwner;
        newOwner = 0x0;
    }

    function withdraw()
        public
        ownerOnly(msg.sender)
    {
        SmartLawTrust smartLaw = SmartLawTrust(trustee);
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
