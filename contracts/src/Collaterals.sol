// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.26;
// import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IVerifier} from "./interfaces/IVerifier.sol";
import { Proof } from "./ProofTypes.sol";
import {Verifier as LimitVerifier} from "./verifiers/can_liquidate.sol";
import {Verifier as BorrowVerifier} from "./verifiers/borrow.sol";

contract Collaterals is IVerifier {
    mapping(address user => uint128 collateralValue) public collaterals;
    mapping(address user => uint[2] state) public states;
    mapping(address user => uint256 deadline ) public liquidationWindows;

    // mapping(address user => Proof state) public states;

    // verifiers
    address limitReachedVerifierAddr;
    address borrowVerifierAddr;
    address withdrawVerifierAddr;

    address bank;

    constructor(address limitReachedVerifierAddr_, address borrowVerifierAddr_, address withdrawVerifierAddr_) {
        limitReachedVerifierAddr = limitReachedVerifierAddr_;
        borrowVerifierAddr = borrowVerifierAddr_;
        withdrawVerifierAddr = withdrawVerifierAddr_;
    }

    function canLiquidate(address collateral, address user) external view returns (bool) {
        return block.timestamp < liquidationWindows[user];
    }

    function prepareLimitProof(Proof memory proof, uint liquidationCollateral, address user) external {
        uint[2] memory state = states[user];
        uint[3] memory args = [state[0], state[1], liquidationCollateral];
        bool allowed = LimitVerifier(limitReachedVerifierAddr).verifyTx(proof, args);
        if (allowed) {
            liquidationWindows[user] = block.timestamp + 2 minutes;
        }
    }

    function borrow(Proof memory proof, uint[2] memory new_state) external {
        uint[2] memory state = states[msg.sender];
        uint[4] memory args = [state[0], state[1], new_state[0], new_state[1]];
        if (BorrowVerifier(borrowVerifierAddr).verifyTx(proof, args)) {
            states[msg.sender] = new_state;
        }
    }

    function canWithdraw(Proof memory proof) external view returns (bool) {
        return false;
        // uint[2] memory state = states[msg.sender];
        // return WithdrawVerifier(withdrawVerifierAddr).verifyTx(proof, state);
    }
}