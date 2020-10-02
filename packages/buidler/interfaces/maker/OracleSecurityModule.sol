// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

interface OracleSecurityModule {
    function peek() external view returns (bytes32, bool);

    function peep() external view returns (bytes32, bool);

    function bud(address) external view returns (uint256);
}