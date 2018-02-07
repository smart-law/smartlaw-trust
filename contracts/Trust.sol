pragma solidity ^0.4.15;

contract Trust {

  string public name;
  string public property;
  bool public deleted;

  function Trust() public {
      deleted = false;
  }

  modifier notDissolved() {
      require(deleted == false);
      _;
  }

  function wasRestored()
      internal
  {
      deleted = false;
  }

  function wasDissolved()
      internal
  {
      deleted = true;
  }

}
