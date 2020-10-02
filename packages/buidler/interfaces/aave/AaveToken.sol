// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

interface AaveToken {
    function underlyingAssetAddress() external view returns (address);
}