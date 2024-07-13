// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IVerifier {
    struct G1Point {
        uint X;
        uint Y;
    }
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    struct Proof {
        G1Point a;
        G2Point b;
        G1Point c;
    }

    function limitReached(
        Proof memory proof,
        uint borrowLimit
    ) external view returns (bool);
    function add(Proof memory proof) external view returns (bool);
    function canWithdraw(Proof memory proof) external view returns (bool);
}
