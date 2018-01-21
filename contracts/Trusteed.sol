pragma solidity ^0.4.15;

contract Trusteed {
    address public trustee;
    address public newTrustee;

    event TrusteeUpdate(address _prevTrustee, address _newTrustee);

    function Trusteed(address _trustee) public {
        trustee = _trustee;
    }

    modifier trusteeOnly(address _address) {
        require(_address == trustee);
        _;
    }

    function transferTrustee(address _newTrustee)
        public
        trusteeOnly(msg.sender)
    {
        newTrustee = _newTrustee;
    }

    function acceptTrustee()
        public
    {
        require(msg.sender == newTrustee);
        TrusteeUpdate(trustee, newTrustee);
        trustee = newTrustee;
        newTrustee = 0x0;
    }
}
