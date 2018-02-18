pragma solidity ^0.4.4;
import './User.sol';

contract Trustee is User {

    string public name;
    address[] public trusts;

    function Trustee(
        address _dexRE,
        address _liquidRE,
        address _owner,
        string _name
    )
        public
        User(msg.sender, _owner, _dexRE, _liquidRE)
    {
        name = _name;
    }

    function trustAddresses()
        public
        view returns(address[])
    {
        return trusts;
    }

    function addTrust(address _trust)
        public
        adminOnly
    {
        trusts.push(_trust);
    }


}
