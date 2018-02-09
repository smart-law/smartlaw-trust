pragma solidity ^0.4.15;
import { Bid } from './Bid.sol';

contract AuctionableTrust {

    uint public auctionEndDate;
    address public highestBid;
    address[] bids;
    bool public auctionRunning;

    event BidCreated(address bid);

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

    function placeBid(address _entity, uint _amount)
        internal
    {
        Bid bid = new Bid(_entity, _amount);
        bids.push(bid);
        if(highestBid == 0x0) {
            highestBid = bid;
        } else {
            Bid currentHighestBid = Bid(highestBid);
            require(msg.value > currentHighestBid.amount());
            highestBid = bid;
        }
        BidCreated(bid);
    }



}
