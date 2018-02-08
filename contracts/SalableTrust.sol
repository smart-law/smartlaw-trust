pragma solidity ^0.4.15;
import { Sale } from './Sale.sol';

contract SalableTrust {

    address[] saleProposalList;
    address public activeSale;

    event SaleProposalAdded(address sale);
    event SaleCreated(address sale);

    function SalableTrust()
        public
    {
        activeSale = 0x0;
    }

    modifier noActiveSale() {
        require(!forSale());
        _;
    }

    modifier hasActiveSale() {
        require(forSale());
        _;
    }

    function forSale()
        public
        view
        returns (bool)
    {
        return activeSale != 0x0;
    }

    function forSaleAmount()
        public
        view
        returns (uint)
    {
        if(forSale()) {
            Sale sale = Sale(activeSale);
            return sale.amount();
        }
        else {
            return 0;
        }
    }

    function setActiveSale(address _sale)
        internal
        noActiveSale
    {
        activeSale = _sale;
        address[] memory emptyAddressArray;
        saleProposalList = emptyAddressArray;
        SaleCreated(_sale);
    }

    function newSale(address _sale)
        internal
        noActiveSale
    {
        saleProposalList.push(_sale);
        SaleProposalAdded(_sale);
    }

    function saleProposals()
        public
        view returns (address[])
    {
        return saleProposalList;
    }

    function doCancelSale()
        internal
        hasActiveSale
    {
        activeSale = 0x0;
        address[] memory emptyAddressArray;
        saleProposalList = emptyAddressArray;
    }

}
