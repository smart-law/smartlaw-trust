pragma solidity ^0.4.4;
import { DexRE } from './DexRE.sol';

contract User {

    address public factory;
    mapping (string => uint) funds;
    bool public verified;
    address public owner;
    address public newOwner;
    address public DexREAdmin;
    address public LiquidREAdmin;
    bool public status;

    function User(
        address _factory,
        address _owner,
        address _dexRE,
        address _liquidRE
    )
        public
    {
        funds['DexRE'] = 0;
        funds['LiquidRE'] = 0;
        verified = false;
        factory = _factory;
        owner = _owner;
        DexREAdmin = _dexRE;
        LiquidREAdmin = _liquidRE;
        status = true;
    }

    modifier enabledOnly() {
        require(status);
        _;
    }

    modifier ownerOnly(address _address) {
        require(_address == owner);
        _;
    }

    modifier dexREOnly(address _address) {
        require(_address == DexREAdmin);
        _;
    }

    modifier liquidREOnly(address _address) {
        require(_address == LiquidREAdmin);
        _;
    }

    modifier factoryOnly() {
        require(factory == msg.sender);
        _;
    }

    modifier adminOnly() {
        require(msg.sender == DexREAdmin || msg.sender == LiquidREAdmin);
        _;
    }

    modifier validateSender() {
        require(msg.sender == owner || msg.sender == factory || msg.sender == DexREAdmin || msg.sender == LiquidREAdmin);
        _;
    }

    function disabled()
        public
        adminOnly
    {
        status = false;
    }

    function transferOwnership(address _sender, address _newOwner)
        public
        ownerOnly(_sender)
        factoryOnly
    {
        require(_newOwner != owner);
        newOwner = _newOwner;
    }

    function acceptOwnership(address _sender)
        public
        factoryOnly
    {
        require(_sender == newOwner);
        owner = newOwner;
        newOwner = 0x0;
    }

    function availableFunds(string _source)
        public
        validateSender
        view returns(uint)
    {
        return funds[_source];
    }

    function verify()
        public
        adminOnly
    {
        verified = true;
    }

    function withdraw(uint _amount, string _source)
        public
        ownerOnly(msg.sender)
    {
        require(keccak256(_source) == keccak256('DexRE') || keccak256(_source) == keccak256('LiquidRE'));
        if(keccak256(_source) == keccak256('DexRE')) {
            DexRE dexRE = DexRE(DexREAdmin);
            dexRE.withdraw(_amount);
        }
    }

    function deposit(uint _amount, string _source)
        public
        adminOnly
    {
        require(keccak256(_source) == keccak256('DexRE') || keccak256(_source) == keccak256('LiquidRE'));
        funds[_source] += _amount;
    }

    function mint(uint _amount, string _source)
        public
        adminOnly
    {
        require(keccak256(_source) == keccak256('DexRE') || keccak256(_source) == keccak256('LiquidRE'));
        require(funds[_source] >= _amount);
        funds[_source] -= _amount;
    }

}
