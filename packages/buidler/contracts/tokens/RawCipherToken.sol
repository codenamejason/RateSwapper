// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "@nomiclabs/buidler/console.sol";

contract RawCipherToken is ERC20 {
    address public owner; // = 0xceeaF9BBf52bb33F36F945aC09c38739766D1e48;

    

    modifier onlyOwner() {
        require(msg.sender == owner, "You must be the owner");
        _;
    }

    event TokensMinted (address user, uint256 amount);
    event TokensBurned (address user, uint256 amount);

    constructor (address _owner)
        ERC20("RawCipherToken", "rRCT")
        public
    {

        owner = _owner;
        _mint(0xceeaF9BBf52bb33F36F945aC09c38739766D1e48, 10 ether);
        //_mint(0xb10e157AC07857BB4dca93902dd76d5142FBAe6D, 1000 * 10 ** 18);
        //0xceeaF9BBf52bb33F36F945aC09c38739766D1e48
    }

    function mintUserTokens(address user, uint256 amount)
        public onlyOwner
    {
        _mint(user, amount);
        
        emit TokensMinted(user, amount);
    }

    function burnUserTokens(address user, uint256 amount)
        public onlyOwner
    {
        //require(balances[user] >= amount, "User does not have enough tokens to burn");
        //balances[user] = balances[user] - amount;
        _burn(user, amount);
        emit TokensBurned(user, amount);
    }
}