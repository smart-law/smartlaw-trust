const uint pointMultiplier = 10e18;

struct Account {
  uint balance;
  uint lastDividendPoints;
}

mapping(address=>Account) accounts;
uint totalSupply;
uint totalDividendPoints;
uint unclaimedDividends;

function dividendsOwing(address account) internal returns(uint) {
  var newDividendPoints = totalDividendPoints - accounts[account].lastDividendPoints;
  return (accounts[account].balance * newDividendPoints) / pointMultiplier;
}

modifier updateAccount(address account) {
  var owing = dividendsOwing(account);
  if(owing > 0) {
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
