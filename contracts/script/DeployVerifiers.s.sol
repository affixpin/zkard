// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";

// Import modules here
import {Collaterals} from "src/Collaterals.sol";
import {Verifier as BorrowVerifier} from "src/verifiers/borrow.sol";
import {Verifier as LimitVerifier} from "src/verifiers/can_liquidate.sol";

/// @title DeployModuleScript
contract DeployModuleScript is Script {
    function run() public {
        // Get private key for deployment
        vm.startBroadcast(vm.envUint("PK"));

        BorrowVerifier bv = new BorrowVerifier();
        LimitVerifier lv = new LimitVerifier();

        Collaterals v = new Collaterals(address(lv), address(bv), address(bv));

        vm.stopBroadcast();
        console.log("Deploying collaterals at: %s", address(v));
    }
}
