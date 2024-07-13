// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import {RegistryDeployer} from "modulekit/deployment/RegistryDeployer.sol";

// Import modules here
import {ZkardModule} from "src/ZkardModule.sol";

/// @title DeployModuleScript
contract DeployModuleScript is Script, RegistryDeployer {
    function run() public {
        // Setup module bytecode, deploy params, and data
        bytes memory bytecode = type(ZkardModule).creationCode;
        bytes memory deployParams = abi.encode(
            0x0D0e2d28e324C4D7cce09fdED31944191E22c48E,
            address(0)
        );
        bytes memory data = "";

        // Get private key for deployment
        vm.startBroadcast(vm.envUint("PK"));

        // Deploy module
        address module = deployModule({
            code: bytecode,
            deployParams: deployParams,
            salt: bytes32(0),
            data: data
        });

        // Stop broadcast and log module address
        vm.stopBroadcast();
        console.log("Deploying module at: %s", module);
    }
}
