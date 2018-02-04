pragma solidity ^0.4.15;

contract Dividends
{
  struct Account {
    uint balance;
    uint lastDividendPoints;
  }
  mapping(address => Account) accounts;
  uint totalSupply;
  uint totalDividendPoints;
  uint unclaimedDividends;
  uint constant pointsMultiplier = 10e18;

  function dividendsOwing(address account) internal returns(uint) {
    var newDividendPoints = totalDividendPoints - accounts[account].lastDividendPoints;
    return (accounts[account].balance * newDividendPoints) / pointsMultiplier;
  }
  modifier updateAccount(address account) {
    var owing = dividendsOwing(account);
    if (owing > 0) {
      unclaimedDividends -= owing;
      accounts[account].balance += owing;
      accounts[account].lastDividendPoints = totalDividendPoints;
    }
    _;
  }

  function disburse(uint amount) {
    totalDividendPoints += (amount * pointsMultiplier / totalSupply);
    totalSupply += amount;
    unclaimedDividends += amount;
  }
}
