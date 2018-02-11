pragma solidity ^0.4.15;
import { Bid } from './Bid.sol';

contract AuctionableTrust {

    uint public auctionEndDate;
    address public highestBid;
    address[] bidsList;
    bool public auctionRunning;

    modifier onAuction()
    {
        require(auctionRunning);
        _;
    }

    function AuctionableTrust()
        public
    {
        resetAuctionFields();
    }

    function runAuction()
        internal
    {
        require(!auctionRunning);
        auctionEndDate = now + 14 days;
        auctionRunning = true;
    }

    function stopAuction()
        internal
    {
        require(auctionRunning);
        resetAuctionFields();
    }

    function resetAuctionFields()
        private
    {
        highestBid = 0x0;
        auctionEndDate = 0;
        auctionRunning = false;
    }

    function bids()
        public
        view returns(address[])
    {
        return bidsList;
    }

    /**
     * should be removed for the purpose of testing
     */
    function makeAuctionEnd()
        public
    {
        auctionEndDate = 0;
    }

}
