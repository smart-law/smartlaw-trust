pragma solidity ^0.4.15;

import './UtilsLib.sol';
import './Owned.sol';
import './Trusteed.sol';

import { Beneficiary } from './Beneficiary.sol';
import { Sale } from './Sale.sol';
import { Loan } from './Loan.sol';
import { Bid } from './Bid.sol';
import { SmartTrustRE } from './SmartTrustRE.sol';
import { Entity } from './Entity.sol';
import { EntityFactory } from './EntityFactory.sol';

import './Trust.sol';
import './LoanableTrust.sol';
import './SalableTrust.sol';
import './AuctionableTrust.sol';

contract TrustRE is Trust, SalableTrust, LoanableTrust, AuctionableTrust, Trusteed {

  address[] beneficiaries;
  address[] pendingBeneficiaries;
  address[] dissolveSignatures;

  event PendingBeneficiaryAdded(address beneficiary);
  event BeneficiaryAdded(address entity);

  function TrustRE(string _name, string _property, address _beneficiary)
      public
      Trusteed(msg.sender)
  {
      name = _name;
      property = _property;
      beneficiaries.push(_beneficiary);
  }

  modifier beneficiary(address _address) {
      require(isBeneficiary(_address));
      _;
  }

  function isBeneficiary(address _address)
      public
      notDissolved
      view returns (bool)
  {
      return UtilsLib.isAddressFound(beneficiaries, _address);
  }

  function beneficiariesSignatures()
      public
      notDissolved
      view returns (address[])
  {
      return beneficiaries;
  }

  function getBeneficiaryByIndex(uint index)
      public
      notDissolved
      view returns (address)
  {
      return beneficiaries[index];
  }

  function beneficiariesCount()
      public
      notDissolved
      view returns (uint)
  {
      return beneficiaries.length;
  }

  function getPendingBeneficiaries()
      public
      notDissolved
      view returns (address[])
  {
      return pendingBeneficiaries;
  }

  function dissolve()
      public
      notDissolved
      noActiveLoan
      noActiveSale
  {
      address _entity = validateSender();
      if(UtilsLib.isAddressFound(dissolveSignatures, _entity))
          revert();
      else
          dissolveSignatures.push(_entity);

      if(beneficiaries.length == dissolveSignatures.length)
      {
          wasDissolved();
      }
  }

  function cancelSale()
      public
      notDissolved
  {
      validateSender();
      doCancelSale();
  }

  function sold(address _entity)
      public
      trusteeOnly(msg.sender)
  {
      resetBeneficiary(_entity);
      wasRestored();
      doCancelSale();
  }

  function validateSender()
      private
      view returns (address)
  {
      SmartTrustRE smartLaw = SmartTrustRE(trustee);
      EntityFactory entityFactoryInstance = EntityFactory(smartLaw.entityFactory());
      require(entityFactoryInstance.isEntityOwner(msg.sender));
      address _entity = entityFactoryInstance.entityAddress(msg.sender);
      require(isBeneficiary(_entity));
      return _entity;
  }

  function newSaleOffer(uint _amount)
      public
      notDissolved
      noActiveLoan
  {
      address _entity = validateSender();
      Sale saleOffer = new Sale(address(this), _amount, _entity);
      if(beneficiaries.length > 1) {
          newSale(saleOffer);
      }
      else {
          setActiveSale(saleOffer);
          saleOffer.deactivate();
      }
  }

  /**
   * @dev allow beneficiaries to agree to sale offer amount
   * @param  _sale sale address of the sale offer
   */
  function agreeToSaleOffer(address _sale)
      public
      notDissolved
      noActiveLoan
  {
      address _entity = validateSender();
      Sale saleOffer = Sale(_sale);
      saleOffer.sign(_entity);
      if(beneficiaries.length == saleOffer.countSignatures())
      {
          setActiveSale(saleOffer);
          saleOffer.deactivate();
      }
  }

  /**
   * @dev allows adding new beneficiary entity to trust
   * @param  _beneficiaryEntity entity address of the new beneficiary
   */
  function newBeneficiary(address _beneficiaryEntity)
      public
      notDissolved
      noActiveLoan
      noActiveSale
  {
      SmartTrustRE smartLaw = SmartTrustRE(trustee);
      EntityFactory entityFactoryInstance = EntityFactory(smartLaw.entityFactory());
      require(entityFactoryInstance.isEntityOwner(msg.sender));
      require(entityFactoryInstance.isEntity(_beneficiaryEntity));
      address _entity = entityFactoryInstance.entityAddress(msg.sender);
      require(isBeneficiary(_entity));
      if(beneficiaries.length > 1) {
          Beneficiary pendingNewBeneficiary = new Beneficiary(address(this), _beneficiaryEntity, _entity);
          pendingBeneficiaries.push(pendingNewBeneficiary);
          PendingBeneficiaryAdded(pendingNewBeneficiary);
      }
      else {
          beneficiaries.push(_beneficiaryEntity);
          BeneficiaryAdded(_beneficiaryEntity);
      }
  }

  /**
   * @dev allow beneficiaries to agree to add pending beneficiary
   * @param  _beneficiary beneficiary address of the pending beneficiary
   */
  function agreeToAddBeneficiary(address _beneficiary)
      public
      notDissolved
      noActiveLoan
      noActiveSale
  {
      address _entity = validateSender();
      Beneficiary pendingBeneficiary = Beneficiary(_beneficiary);
      pendingBeneficiary.sign(_entity);
      if(beneficiaries.length == pendingBeneficiary.countSignatures())
      {
          beneficiaries.push(pendingBeneficiary.entity());
          pendingBeneficiary.deactivate();
      }
  }

  function getDissolveSignatures()
      public
      notDissolved
      view returns (address[])
  {
      return dissolveSignatures;
  }

  function newLoanProposal(uint _amount, uint _interest, uint _secondsBeforeDue)
      public
      notDissolved
      noActiveSale
  {
      address _entity = validateSender();
      Loan loanProposal = new Loan(address(this), _amount, _interest, _secondsBeforeDue, _entity);
      if(beneficiaries.length > 1) {
          newLoan(loanProposal);
      }
      else {
          setActiveLoan(loanProposal);
          loanProposal.deactivate();
      }
  }

  /**
   * @dev allow beneficiaries to agree to any loan proposals
   * @param  _loan loan address of the loan proposal
   */
  function agreeToLoanProposal(address _loan)
      public
      notDissolved
      noActiveSale
  {
      address _entity = validateSender();
      Loan loanProposal = Loan(_loan);
      loanProposal.sign(_entity);
      if(beneficiaries.length == loanProposal.countSignatures())
      {
          setActiveLoan(loanProposal);
          loanProposal.deactivate();
      }
  }

  function loanDue()
      public
      notDissolved
      hasActiveLoan
  {
      Loan loan = Loan(activeLoan);
      require(loan.isDue());
      loan.deactivate();
      activeLoan = 0x0;
      runAuction();
  }

  function auctionEnd()
      public
      notDissolved
      noActiveLoan
      noActiveSale
      onAuction
  {
      require(now >= auctionEndDate);
      address _newOwner = lender;
      if(highestBid != 0x0) {
        Bid bid = Bid(highestBid);
        _newOwner = bid.owner();
      }
      resetBeneficiary(_newOwner);
      stopAuction();
  }

  function resetBeneficiary(address _entity)
      internal
  {
      address[] memory emptyAddressArray;
      beneficiaries = emptyAddressArray;
      pendingBeneficiaries = emptyAddressArray;
      dissolveSignatures = emptyAddressArray;
      beneficiaries.push(_entity);
  }

  function funded(address _entity)
      public
      hasActiveLoan
      notDissolved
      trusteeOnly(msg.sender)
  {
      lender = _entity;
      clearLoanProposals();
  }

  function loanPaid()
      public
      hasActiveLoan
      notDissolved
      trusteeOnly(msg.sender)
  {
      Loan loan = Loan(activeLoan);
      loan.deactivate();
      activeLoan = 0x0;
      lender = 0x0;
  }

  function setHighestBid(address _bid)
      public
      notDissolved
      onAuction
      trusteeOnly(msg.sender)
  {
      highestBid = _bid;
  }

  function newBid(address _bid)
      public
      notDissolved
      onAuction
      trusteeOnly(msg.sender)
  {
      bidsList.push(_bid);
  }

}
