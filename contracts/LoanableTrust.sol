pragma solidity ^0.4.15;
import { Loan } from './Loan.sol';

contract LoanableTrust {

    address[] loanProposalList;
    address public activeLoan;

    event LoanProposalAdded(address loan);
    event LoanCreated(address loan);

    function LoanableTrust()
        public
    {
        activeLoan = 0x0;
    }

    modifier noActiveLoan() {
        require(activeLoan == 0x0);
        _;
    }

    function newLoanProposal(address _entity, uint _amount, uint _interest, uint _dueDate)
        public
        noActiveLoan
    {
        Loan loan = new Loan(address(this), _amount, _interest, _dueDate, _entity);
        loanProposalList.push(loan);
        LoanProposalAdded(loan);
    }

    function setActiveLoan(address _loan)
        private
        noActiveLoan
    {
        activeLoan = _loan;
        address[] memory emptyAddressArray;
        loanProposalList = emptyAddressArray;
        LoanCreated(_loan);
    }

    function loanProposals()
        public
        constant returns (address[])
    {
        return loanProposalList;
    }

}
