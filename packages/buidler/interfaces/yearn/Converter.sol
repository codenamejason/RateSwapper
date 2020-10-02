// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

interface Converter {
    function convert(address) external returns (uint256);
}