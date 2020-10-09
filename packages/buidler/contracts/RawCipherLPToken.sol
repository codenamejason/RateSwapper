pragma solidity ^0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RawCipherLPToken is ERC20 {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor(address _owner) 
        public 
        ERC20("Raw Cipher LP Token V1", "RCT V1 LP") 
    {
        owner = _owner;
         _mint(0xceeaF9BBf52bb33F36F945aC09c38739766D1e48, 1000e18);
         _mint(0xc783df8a850f42e7F7e57013759C285caa701eB6, 1000e18);
    }

    function mintLPTokens(address _user, uint256 _amount)
        external 
        onlyOwner
    {
        _mint(_user, _amount);
    }
}