pragma solidity ^0.4.15;

contract Bid {

    uint public amount;
    address public owner; // entity address of the bidder
    uint public date;

    function Bid(address _owner, uint _amount)
        public
    {
        owner = _owner;
        amount = _amount;
        date = now;
    }

}
