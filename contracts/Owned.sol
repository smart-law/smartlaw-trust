pragma solidity ^0.4.15;

contract Owned {
    address public owner;
    address public newOwner;

    event OwnerUpdate(address _prevOwner, address _newOwner);

    function Owned(address _owner) public {
        owner = _owner;
    }

    modifier ownerOnly {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address _newOwner)
        public
        ownerOnly
    {
        require(_newOwner != owner);
        newOwner = _newOwner;
    }

    function acceptOwnership()
        public
    {
        require(msg.sender == newOwner);
        OwnerUpdate(owner, newOwner);
        owner = newOwner;
        newOwner = 0x0;
    }
}
