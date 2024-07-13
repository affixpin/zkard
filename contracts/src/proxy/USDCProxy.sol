// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IPossitionProxy} from "../interfaces/IPossitionProxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract USDCProxy is IPossitionProxy {
    IERC20 public immutable asset;

    constructor(IERC20 asset_) {
        asset = asset_;
    }

    function isValidationNeeded(
        address account,
        address target,
        bytes calldata callData
    ) external view returns (bool) {
        return asset.balanceOf(account) > 0;
    }

    function isLiquidation(
        address account,
        address target,
        bytes calldata callData
    ) external view returns (bool) {
        if (target != address(asset)) return false;
        if (callData.length >= 4) {
            if (bytes4(callData[:4]) == IERC20.transfer.selector) {
                return true;
            }
        }
        return false;
    }

    function getBorrowLimit(address account) external view returns (uint256) {
        return asset.balanceOf(account);
    }
}
