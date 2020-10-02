// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

interface WETH {
    function deposit() external payable;

    function withdraw(uint256 wad) external;

    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);
}