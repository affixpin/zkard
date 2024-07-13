// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";

// Import modules here
import {Verifier} from "src/add.sol";

/// @title DeployModuleScript
contract DeployModuleScript is Script {
    function run() public {
        // Get private key for deployment
        vm.startBroadcast(vm.envUint("PK"));

        // Deploy module
        Verifier v = new Verifier();

        // Stop broadcast and log module address
        vm.stopBroadcast();
        console.log("Deploying module at: %s", address(v));
    }
}
