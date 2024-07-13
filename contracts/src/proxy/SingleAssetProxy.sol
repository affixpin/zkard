// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IPossitionProxy} from "../interfaces/IPossitionProxy.sol";
import {IUniswapV3Pool} from "v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import {FullMath} from "v3-core/contracts/libraries/FullMath.sol";
// import {TickMath} from "v3-core/contracts/libraries/TickMath.sol";

// import {OracleLibrary} from "v3-periphery/contracts/libraries/OracleLibrary.sol";

contract SingleAssetProxy is IPossitionProxy {
    IERC20 public immutable asset;
    address public immutable quoteToken;
    IUniswapV3Pool public immutable uniswapPool;

    constructor(IERC20 asset_, IUniswapV3Pool uniswapPool_) {
        asset = asset_;
        uniswapPool = uniswapPool_;

        address token0 = uniswapPool.token0();
        address token1 = uniswapPool.token1();
        if (token0 == address(asset)) {
            quoteToken = token1;
        } else {
            quoteToken = token0;
        }
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
        uint32 period = 360;
        uint32[] memory secondsAgos = new uint32[](2);
        secondsAgos[0] = period;
        secondsAgos[1] = 0;
        (int56[] memory tickCumulatives, ) = uniswapPool.observe(secondsAgos);

        uint256 balance = asset.balanceOf(account);
        int24 arithmeticMeanTick = int24(
            (tickCumulatives[1] - tickCumulatives[0]) / int56(int32(period))
        );
        // uint256 price = (tickCumulatives[1] - tickCumulatives[0]) / period;
        // return balance * price;
        // (int56[] memory tickCumulatives, ) = uniswapPool.observe(period);
        // (int24 arithmeticMeanTick, ) = OracleLibrary.consult(
        //     uniswapPool.address,
        //     period
        // );

        return
            uint128(
                getQuoteAtTick(
                    arithmeticMeanTick,
                    uint128(balance),
                    address(asset),
                    quoteToken
                )
            );

        return 0;
    }

    function getQuoteAtTick(
        int24 tick,
        uint128 baseAmount,
        address baseToken,
        address quoteToken
    ) internal pure returns (uint256 quoteAmount) {
        // uint160 sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick);
        // // Calculate quoteAmount with better precision if it doesn't overflow when multiplied by itself
        // if (sqrtRatioX96 <= type(uint128).max) {
        //     uint256 ratioX192 = uint256(sqrtRatioX96) * sqrtRatioX96;
        //     quoteAmount = baseToken < quoteToken
        //         ? FullMath.mulDiv(ratioX192, baseAmount, 1 << 192)
        //         : FullMath.mulDiv(1 << 192, baseAmount, ratioX192);
        // } else {
        //     uint256 ratioX128 = FullMath.mulDiv(
        //         sqrtRatioX96,
        //         sqrtRatioX96,
        //         1 << 64
        //     );
        //     quoteAmount = baseToken < quoteToken
        //         ? FullMath.mulDiv(ratioX128, baseAmount, 1 << 128)
        //         : FullMath.mulDiv(1 << 128, baseAmount, ratioX128);
        // }

        // dev: there is an issue with the core-v3 pragma compatibility, so we
        // simulate getting price
        quoteAmount = uint256(int256(tick)) * 1000000;
    }
}
