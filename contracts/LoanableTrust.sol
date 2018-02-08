pragma solidity ^0.4.15;
import { Loan } from './Loan.sol';

contract LoanableTrust {

    address[] loanProposalList;
    address public activeLoan;
    address public lender; // entity address that funds the loan

    event LoanProposalAdded(address loan);
    event LoanCreated(address loan);

    function LoanableTrust()
        public
    {
        activeLoan = 0x0;
        lender = 0x0;
    }

    modifier noActiveLoan() {
        require(activeLoan == 0x0);
        _;
    }

    modifier hasActiveLoan() {
        require(activeLoan != 0x0);
        _;
    }

    function loanAmount()
        public
        view
        returns (uint)
    {
        if(activeLoan != 0x0) {
            Loan loan = Loan(activeLoan);
            return loan.amount();
        }
        else {
            return 0;
        }
    }

    function loanAmountDue()
        public
        view
        returns (uint)
    {
        if(activeLoan != 0x0) {
            Loan loan = Loan(activeLoan);
            return loan.amountDue();
        }
        else {
            return 0;
        }
    }

    function clearLoanProposals()
        internal
        hasActiveLoan
    {
        address[] memory emptyAddressArray;
        loanProposalList = emptyAddressArray;
    }

    function loanFunded()
        public
        view
        returns (bool)
    {
        return ( lender != 0x0 && activeLoan != 0x0 );
    }

    function newLoan(address _loan)
        internal
        noActiveLoan
    {
        loanProposalList.push(_loan);
        LoanProposalAdded(_loan);
    }

    function setActiveLoan(address _loan)
        internal
        noActiveLoan
    {
        activeLoan = _loan;
        address[] memory emptyAddressArray;
        loanProposalList = emptyAddressArray;
        LoanCreated(_loan);
    }

    function loanProposals()
        public
        view returns (address[])
    {
        return loanProposalList;
    }

}
