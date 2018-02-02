pragma solidity ^0.4.15;
import './UnderTrust.sol';

contract Loan is UnderTrust {

  uint public amount; // wei
  uint public interest;
  uint public date;

  function Loan(address _trust, uint _amount, uint _interest, address _signature)
      public
      UnderTrust(_trust)
  {
      amount = _amount;
      interest = _interest;
      signatures.push(_signature);
  }
}
