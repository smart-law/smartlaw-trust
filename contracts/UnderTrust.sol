pragma solidity ^0.4.15;
import './UtilsLib.sol';

contract UnderTrust {

    address public trust;
    bool public disabled;
    address[] signatures;

    function UnderTrust(address _trust)
        public
    {
        trust = _trust;
        disabled = false;
    }

    modifier trustOnly {
        require(msg.sender == trust);
        _;
    }

    modifier enabledOnly {
        require(disabled == false);
        _;
    }

    function deactivate()
        public
        trustOnly
    {
        disabled = true;
    }

    function sign(address _signature)
        public
        trustOnly
        enabledOnly
    {
        if(UtilsLib.isAddressFound(signatures, _signature))
            revert();
        else
            signatures.push(_signature);
    }

    function getSignatures()
        public
        enabledOnly
        constant returns (address[])
    {
        return signatures;
    }

    function countSignatures()
        public
        enabledOnly
        constant returns (uint)
    {
        return signatures.length;
    }

}
