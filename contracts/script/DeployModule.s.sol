// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import {RegistryDeployer} from "modulekit/deployment/RegistryDeployer.sol";

// Import modules here
import {ZkardModule} from "src/ZkardModule.sol";
import {USDCProxy} from "src/proxy/USDCProxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Collaterals} from "src/Collaterals.sol";
import {Verifier as BorrowVerifier} from "src/verifiers/borrow.sol";
import {Verifier as LimitVerifier} from "src/verifiers/can_liquidate.sol";

/// @title DeployModuleScript
contract DeployModuleScript is Script, RegistryDeployer {
    function run() public {
        // Setup module bytecode, deploy params, and data
        bytes memory bytecode = type(ZkardModule).creationCode;

        // Get private key for deployment
        vm.startBroadcast(vm.envUint("PK"));

        USDCProxy p0 = new USDCProxy(IERC20(vm.envAddress("USDC")));
        USDCProxy p1 = new USDCProxy(IERC20(vm.envAddress("USDC")));
        USDCProxy p2 = new USDCProxy(IERC20(vm.envAddress("USDC")));

        BorrowVerifier bv = new BorrowVerifier();
        LimitVerifier lv = new LimitVerifier();

        Collaterals c = new Collaterals(address(lv), address(bv), address(bv));

        bytes memory deployParams = abi.encode(
            vm.envAddress("DEPLOYMENT_SENDER"),
            address(c)
        );
        bytes memory data = "";
        // Deploy module
        address module = deployModule({
            code: bytecode,
            deployParams: deployParams,
            salt: bytes32(0),
            data: data
        });

        ZkardModule z = ZkardModule(module);

        z.addCollateralProxy(1, address(p0));
        z.addCollateralProxy(2, address(p1));
        z.addCollateralProxy(3, address(p2));
        // Stop broadcast and log module address
        vm.stopBroadcast();
        console.log("Deploying module at: %s", module);
    }
}
