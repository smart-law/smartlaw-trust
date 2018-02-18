pragma solidity ^0.4.4;
import './User.sol';

contract Entity is User {

    uint public category;
    bool public isAccreditedInvestor;
    string public country;

    function Entity(
        address _dexRE,
        address _liquidRE,
        address _owner,
        uint _category,
        bool _investor,
        string _country
    )
        public
        User(msg.sender, _owner, _dexRE, _liquidRE)
    {
        category = _category;
        isAccreditedInvestor = _investor;
        country = _country;
    }

}
