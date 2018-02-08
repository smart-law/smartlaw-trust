pragma solidity ^0.4.15;
import './UtilsLib.sol';

contract Signable {

    address public trust;
    bool public disabled;
    address[] signatures;

    function Signable(address _trust)
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
        view returns (address[])
    {
        return signatures;
    }

    function countSignatures()
        public
        view returns (uint)
    {
        return signatures.length;
    }

}
