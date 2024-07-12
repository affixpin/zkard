// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IPossitionProxy {
    function verify(
        address account,
        uint8 collateralId,
        uint256 amount
    ) external view returns (bool);
}
