pragma solidity ^0.4.15;
import './Signable.sol';

contract Loan is Signable {

  uint public amount; // wei
  uint public interest;
  uint public dueDate;

  function Loan(address _trust, uint _amount, uint _interest, uint _dueDate, address _signature)
      public
      Signable(_trust)
  {
      amount = _amount;
      interest = _interest;
      dueDate = _dueDate;
      signatures.push(_signature);
  }
}
