pragma solidity ^0.4.4;

import { TrusteeFactory } from './TrusteeFactory.sol';
import { EntityFactory } from './EntityFactory.sol';
import { Entity } from './Entity.sol';
import { TrustRE } from './TrustRE.sol';
import { Trustee } from './Trustee.sol';
import { Bid } from './Bid.sol';
import './Owned.sol';

contract DexRE is Owned {

    bool public status; // disable or enable contract
    address public entityFactory;
    address public trusteeFactory;

    event TrustCreated(address trust);
    event BidCreated(address trust, address bid);

    function DexRE(
        address _entityFactory,
        address _trusteeFactory
    )
        public
        Owned(msg.sender)
    {
        entityFactory = _entityFactory;
        trusteeFactory = _trusteeFactory;
        status = true;
    }

    modifier active() {
        require(status);
        _;
    }

    function updateStatus(bool _disable)
        public
        ownerOnly
    {
        status = _disable;
    }

    function newTrust(address _trustee, string _name, string _property, address _beneficiary)
        public
        active
        // ownerOnly
    {
        EntityFactory entityFactoryInstance = EntityFactory(entityFactory);
        require(entityFactoryInstance.isEntity(_beneficiary));
        TrusteeFactory trusteeFactoryInstance = TrusteeFactory(trusteeFactory);
        require(trusteeFactoryInstance.isTrustee(_trustee));
        TrustRE trust = new TrustRE(_trustee, _name, _property, _beneficiary);
        Trustee trusteeInstance = Trustee(_trustee);
        trusteeInstance.addTrust(trust);
        TrustCreated(trust);
    }

    function senderEntity()
        private
        view returns (address)
    {
        EntityFactory entityFactoryInstance = EntityFactory(entityFactory);
        require(entityFactoryInstance.isEntityOwner(msg.sender));
        return entityFactoryInstance.entityAddress(msg.sender);
    }

    function splitProceed(address _trust, uint _amount)
        private
    {
        require(msg.value >= _amount);
        TrustRE trust = TrustRE(_trust);
        uint beneficiariesCount = trust.beneficiariesCount();

        uint refund = msg.value - _amount;
        if(refund > 0) {
            msg.sender.transfer(refund);
        }

        uint share = _amount / beneficiariesCount;
        for(uint i = 0; i < beneficiariesCount; i++) {
            address beneficiary = trust.getBeneficiaryByIndex(i);
            Entity entity = Entity(beneficiary);
            entity.deposit(share, 'DexRE');
        }
    }

    function fundLoan(address _trust)
        public
        payable
    {
        address _entity = senderEntity();
        TrustRE trust = TrustRE(_trust);
        require(trust.activeLoan() != 0x0); // should have an activate loan proposal
        require(!trust.loanFunded()); // loan should not be funded
        uint amount = trust.loanAmount();
        splitProceed(_trust, amount);
        trust.funded(_entity);
    }

    function verifyEntity(address _entity)
        public
        ownerOnly
    {
        EntityFactory entityFactoryInstance = EntityFactory(entityFactory);
        require(entityFactoryInstance.isEntity(_entity));
        Entity entity = Entity(_entity);
        entity.verify();
    }

    function placeBid(address _trust)
        public
        payable
    {
        address _entity = senderEntity();
        TrustRE trust = TrustRE(_trust);
        require(trust.auctionRunning());
        Bid bid = new Bid(_entity, msg.value);
        address _highestBid = trust.highestBid();
        if(_highestBid == 0x0) {
            trust.setHighestBid(bid);
        } else {
            Bid currentHighestBid = Bid(_highestBid);
            require(msg.value > currentHighestBid.amount());
            Entity entity = Entity(currentHighestBid.owner());
            entity.deposit(currentHighestBid.amount(), 'DexRE');
            trust.setHighestBid(bid);
        }
        trust.newBid(bid);
        BidCreated(_trust, bid);
    }

    function buyTrust(address _trust)
        public
        payable
    {
        address _entity = senderEntity();
        TrustRE trust = TrustRE(_trust);
        require(trust.forSale());
        uint amount = trust.forSaleAmount();
        splitProceed(_trust, amount);
        trust.sold(_entity);
    }

    function payLoan(address _trust)
        public
        payable
    {
        TrustRE trust = TrustRE(_trust);
        require(trust.activeLoan() != 0x0); // should have an activate loan proposal
        require(trust.loanFunded()); // loan should be funded
        uint amountDue = trust.loanAmountDue();
        require(msg.value >= amountDue);
        uint refund = msg.value - amountDue;
        if(refund > 0) {
            msg.sender.transfer(refund);
        }
        Entity entity = Entity(trust.lender());
        entity.deposit(msg.value, 'DexRE');
        trust.loanPaid();
    }

    /**
     * @dev allows entity to withdraw, should be called only from entity contract
    */

    function withdraw(uint _amount)
        public
    {
        EntityFactory entityFactoryInstance = EntityFactory(entityFactory);
        require(entityFactoryInstance.isEntity(msg.sender));
        address _owner = entityFactoryInstance.entityOwner(msg.sender);
        require(_owner != 0x0);
        Entity entity = Entity(msg.sender);
        uint funds = entity.availableFunds('DexRE');
        require(funds >= _amount);
        if(_owner.send(_amount)) {
            entity.mint(_amount, 'DexRE');
        }
    }

}
