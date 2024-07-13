// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Proof } from "../ProofTypes.sol";

interface IVerifier {
    function borrow(Proof memory proof, uint[2] memory new_state) external;
    function canWithdraw(Proof memory proof) external view returns (bool);
    
    // liquidations
    function prepareLimitProof(Proof memory proof, uint liquidationCollateral, address user) external;
    function canLiquidate(address collateral, address user) external view returns (bool); 
}
