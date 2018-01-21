pragma solidity ^0.4.15;
import './UnderTrust.sol';

contract Sale is UnderTrust {

  uint public amount; // wei

  function Sale(address _trust, uint _amount, address _signature)
      public
      UnderTrust(_trust)
  {
      amount = _amount;
      signatures.push(_signature);
  }
}
