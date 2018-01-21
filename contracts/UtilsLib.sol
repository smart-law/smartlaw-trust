pragma solidity ^0.4.15;

library UtilsLib {

    function isAddressFound(address[] _source, address _address)
        public
        returns (bool)
    {
        for (uint i = 0; i < _source.length; i++) {
            if (_source[i] == _address) {
                return true;
            }
        }
        return false;
    }
}
