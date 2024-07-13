// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import {PackedUserOperation} from "modulekit/external/ERC4337.sol";

interface IPossitionProxy {
    function isValidationNeeded(
        address account,
        address target,
        bytes calldata callData
    ) external view returns (bool);
    function isLiquidation(
        address account,
        address target,
        bytes calldata callData
    ) external view returns (bool);
    function getBorrowLimit(address account) external view returns (uint256);
}
