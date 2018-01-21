pragma solidity ^0.4.15;
import './UnderTrust.sol';

contract Beneficiary is UnderTrust {

    address public entity;

    function Beneficiary(address _trust, address _entity, address _signature)
        public
        UnderTrust(_trust)
    {
        entity = _entity;
        signatures.push(_signature);
    }
}
