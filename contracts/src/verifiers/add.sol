// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;

import { G1Point, G2Point, Proof } from "../ProofTypes.sol";


library Pairing {
    /// @return the generator of G1
    function P1() pure internal returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() pure internal returns (G2Point memory) {
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
    }
    /// @return the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) pure internal returns (G1Point memory) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
    }


    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success);
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length);
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[1];
            input[i * 6 + 3] = p2[i].X[0];
            input[i * 6 + 4] = p2[i].Y[1];
            input[i * 6 + 5] = p2[i].Y[0];
        }
        uint[1] memory out;
        bool success;
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success);
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}

contract Verifier {
    using Pairing for *;
    struct VerifyingKey {
        G1Point alpha;
        G2Point beta;
        G2Point gamma;
        G2Point delta;
        G1Point[] gamma_abc;
    }
    function verifyingKey() pure internal returns (VerifyingKey memory vk) {
        vk.alpha = G1Point(uint256(0x1a0d3bc15b943568d8ca98ae1b7f67ee87b7916200b2d21dfdf4cd7542ec3823), uint256(0x1ea0731441d5ca2d6a9151e44c7938ec8265092e3e3815cf93fba641c41dd65f));
        vk.beta = G2Point([uint256(0x1361a166056771d1644dce85bf0a2db0fe32a83529f25926a2fb349c5fe6e4f0), uint256(0x29cf21ccd901e3f7b1dcc01e3343f7832b096eaaef499b709bcf91940b732b9f)], [uint256(0x1a22054173109dd953b45577babf290a586a9e83b4ea5fcab56d9c998311a83c), uint256(0x20ef944937b87a5939c0ef250648f65e933716db0974f2f2ae702333c94ad1ed)]);
        vk.gamma = G2Point([uint256(0x2817f870336cd582452604659abd0d03936e43cd6b09012400cd3f0db450ec15), uint256(0x26741d0f833b30dd5d4e1c22d4018973772c71a59f93b42d8a265ce11fb495ef)], [uint256(0x0010ca6ad1b39f6d9fc3a22e486253cc38903303b5ea5a311f2506e7794f90f7), uint256(0x0a005936bb5b471e8a5c73ca38657163724fcc611ce420a75349b709e54fb3e8)]);
        vk.delta = G2Point([uint256(0x2a074dc592edecd5c30dcc31ceeaf8d7d96ef38943110f7871f7a6b67f748622), uint256(0x146905de32a35850df17a46649f182c797fade1a5495c22b871e6d004e819713)], [uint256(0x10175c49bc528433533c71a3af754d7106192a6a6a33a9f79da2f77996766941), uint256(0x2911d0b037d192624fd32bf97bc9a3c32e8e94a6ece6a6d1586835c16e3d9024)]);
        vk.gamma_abc = new G1Point[](5);
        vk.gamma_abc[0] = G1Point(uint256(0x072f203fb87bcb6e11233125cb7dcede04ef9d664cc6d070475d8260c5e94610), uint256(0x04f759e58d66f6bcc954d84252ffe3cf18c8b45e278ebe8c8d09988162c4431e));
        vk.gamma_abc[1] = G1Point(uint256(0x1dc4cc6e704b70c268d50497e9d5d556cb621c22654fcd5e9d369eba6356eacc), uint256(0x14f94a58ccda33e268def074dd58c43b7022e08b50812cda0cf9c6f893a22c32));
        vk.gamma_abc[2] = G1Point(uint256(0x0c43eda29fba5f8e9c5af78cec79af25d9c6ded2833e261dc68d8b17d09ecb1c), uint256(0x14fb9cb20777c73a6b0c89584e5a232200534a24471d56bb19d93f8c6ce640fe));
        vk.gamma_abc[3] = G1Point(uint256(0x0ae6db2e10f9b780ae4fe60fd2ff1ec00bcf513048741e28bccb1563bc863f2a), uint256(0x0bb8504315e21ab3c9d730d6ab49f2991f2ce91d6a463526fec8cc6f0b17bf34));
        vk.gamma_abc[4] = G1Point(uint256(0x154f625737b0ba1d81e5d2828e0c74d22ae7ed41073e4e39f1b206b26829d0f6), uint256(0x2816c3d31da96022adcf862a2e6c98c5105d6a9526acd99cf9346f6ac7d45f98));
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.gamma_abc.length);
        // Compute the linear combination vk_x
        G1Point memory vk_x = G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field);
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.gamma_abc[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.gamma_abc[0]);
        if(!Pairing.pairingProd4(
             proof.a, proof.b,
             Pairing.negate(vk_x), vk.gamma,
             Pairing.negate(proof.c), vk.delta,
             Pairing.negate(vk.alpha), vk.beta)) return 1;
        return 0;
    }
    function verifyTx(
            Proof memory proof, uint[4] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](4);
        
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
