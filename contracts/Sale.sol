pragma solidity ^0.4.15;
import './Signable.sol';

contract Sale is Signable {

  uint public amount; // wei

  function Sale(address _trust, uint _amount, address _signature)
      public
      Signable(_trust)
  {
      amount = _amount;
      signatures.push(_signature);
  }
}
