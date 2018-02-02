pragma solidity ^0.4.15;

import './UtilsLib.sol';
import './Owned.sol';
import './Trusteed.sol';
import { Beneficiary } from './Beneficiary.sol';
import { Sale } from './Sale.sol';
import { SmartTrustRE } from './SmartTrustRE.sol';
import { Entity } from './Entity.sol';
import { EntityFactory } from './EntityFactory.sol';

contract Trust is Trusteed {

  string public name;
  string public property;
  address[] beneficiaries;
  address[] pendingBeneficiaries;
  address[] sales;
  address[] dissolveSignatures;
  bool public forSale;
  uint public forSaleAmount; // wei
  uint safetyDelay;
  bool public deleted;

  event PendingBeneficiaryAdded(address beneficiary);
  event BeneficiaryAdded(address entity);

  event SaleOfferAdded(address sale);

  function Trust(string _name, string _property, address _beneficiary)
      public
      Trusteed(msg.sender)
  {
      name = _name;
      property = _property;
      beneficiaries.push(_beneficiary);
      forSaleAmount = 0;
      forSale = false;
      deleted = false;
  }

  modifier notDissolved() {
      require(deleted == false);
      _;
  }

  modifier notForSale() {
      require(forSale == false);
      _;
  }

  modifier isForSale() {
      require(forSale == true);
      _;
  }

  modifier beneficiary(address _address) {
      require(isBeneficiary(_address));
      _;
  }

  function isBeneficiary(address _address)
      public
      notDissolved
      constant returns (bool)
  {
      return UtilsLib.isAddressFound(beneficiaries, _address);
  }

  function beneficiariesSignatures()
      public
      notDissolved
      constant returns (address[])
  {
      return beneficiaries;
  }

  function getBeneficiaryByIndex(uint index)
      public
      notDissolved
      constant returns (address)
  {
      return beneficiaries[index];
  }

  function beneficiariesCount()
      public
      notDissolved
      constant returns (uint)
  {
      return beneficiaries.length;
  }

  function getPendingBeneficiaries()
      public
      notDissolved
      constant returns (address[])
  {
      return pendingBeneficiaries;
  }

  function dissolve()
      public
      notDissolved
  {
      address _entity = validateSender();
      if(UtilsLib.isAddressFound(dissolveSignatures, _entity))
          revert();
      else
          dissolveSignatures.push(_entity);

      if(beneficiaries.length == dissolveSignatures.length)
      {
          deleted = true;
      }
  }

  function cancelSale()
      public
      notDissolved
      isForSale
  {
      validateSender();
      forSale = false;
      forSaleAmount = 0;
      address[] memory emptyAddressArray;
      sales = emptyAddressArray;
  }

  function sold(address _entity)
      public
      trusteeOnly(msg.sender)
  {
      address[] memory emptyAddressArray;
      forSale = false;
      forSaleAmount = 0;
      sales = emptyAddressArray;
      beneficiaries = emptyAddressArray;
      pendingBeneficiaries = emptyAddressArray;
      dissolveSignatures = emptyAddressArray;
      deleted = false;
      beneficiaries.push(_entity);
  }

  function validateSender()
      private
      constant returns (address)
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
      notForSale
  {
      address _entity = validateSender();
      if(beneficiaries.length > 1) {
          Sale saleOffer = new Sale(address(this), _amount, _entity);
          sales.push(saleOffer);
          SaleOfferAdded(saleOffer);
      }
      else {
          forSale = true;
          forSaleAmount = _amount;
      }
  }

  /**
   * @dev allow beneficiaries to agree to sale offer amount
   * @param  _sale sale address of the sale offer
   */
  function agreeToSaleOffer(address _sale)
      public
      notDissolved
      notForSale
  {
      address _entity = validateSender();
      Sale saleOffer = Sale(_sale);
      saleOffer.sign(_entity);
      if(beneficiaries.length == saleOffer.countSignatures())
      {
          forSale = true;
          forSaleAmount = saleOffer.amount();
          saleOffer.deactivate();
          address[] memory emptyAddressArray;
          sales = emptyAddressArray;
      }
  }

  /**
   * @dev allows adding new beneficiary entity to trust
   * @param  _beneficiaryEntity entity address of the new beneficiary
   */
  function newBeneficiary(address _beneficiaryEntity)
      public
      notDissolved
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
      constant returns (address[])
  {
      return dissolveSignatures;
  }

  function saleOffers()
      public
      notDissolved
      constant returns (address[])
  {
      return sales;
  }
}
