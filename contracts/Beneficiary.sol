pragma solidity ^0.4.15;
import './Signable.sol';

contract Beneficiary is Signable {

    address public entity;

    function Beneficiary(address _trust, address _entity, address _signature)
        public
        Signable(_trust)
    {
        entity = _entity;
        signatures.push(_signature);
    }
}
