// This file is MIT Licensed.
//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
pragma solidity ^0.8.0;
import { Proof, G1Point, G2Point } from "../ProofTypes.sol";
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
        vk.alpha = G1Point(uint256(0x148b7048cffc9563b86e4ebed69f3f8bc76b1a9b5816501ca5057c28d42adfbe), uint256(0x27ffd918fb849976d108ea361464f1b3b0629a9cd11e7d174049162b38af11d5));
        vk.beta = G2Point([uint256(0x1e05b2cc28828accf5a2ed79a2da47f4cf4262d0bebfbc289b3cf4e6c9cf12b2), uint256(0x0e69ab0bcf343cf29d973ecb79b2dbd1a298b98242f9c274b613ef297ddfbef7)], [uint256(0x2e3ca0beefcde7c2f3e89e773f784aaf9ae0a92d14542d3eefadbce616dd838d), uint256(0x228ba7706c2a10a6cd035a74c8378ec452dc589af0dcd7eb1feb882d8e28c8b9)]);
        vk.gamma = G2Point([uint256(0x0656d11f9840a6105e629e488b2ec37f10da2667f8fbe5f311970961b7e1bfce), uint256(0x28db840557fcd63ba483b3a4467bec695e57ea81474046ea465c8c30016b44fb)], [uint256(0x0efe5726a6191505dace9dd009f5ac78b314f95bb8c0dcfb695823aedb0b2164), uint256(0x21f06f55a98c2e7a3f2f9e1db111b6f084866ccb004fd1c083b6f71f3c36489c)]);
        vk.delta = G2Point([uint256(0x2976cedc60c2ff956f4cc175a054e257f7125f678bc1cdd2f8bae5ac2e03ad56), uint256(0x21488ca7321ecbd4da9642e1e2e145b66a166141af11fa93e9de791b79a2f5b5)], [uint256(0x2ccf221adfd168aa9e36353ed2bc43a35cd95c642748c1c8a67686a09f54d3b0), uint256(0x18138802146714bb30c41380da0e22ff309110188bab32cf705dec4312585670)]);
        vk.gamma_abc = new G1Point[](4);
        vk.gamma_abc[0] = G1Point(uint256(0x241317e5b274021f5f5c2224848fb5c5eceef97a1b2a4a95d9091aa794dfbeaf), uint256(0x17aeee9163a20a646fd2462830e59e86f565714f7db0cb606ec940ae488d79ff));
        vk.gamma_abc[1] = G1Point(uint256(0x027484cc32e1d343bec8902d9d03320cea85b58c4abc464aefa86f2b74a82abe), uint256(0x281782baf90d6e17fbe226f75c021de945049851d718db7ee401d93d0d7ae154));
        vk.gamma_abc[2] = G1Point(uint256(0x139ce81e8d1f1fdedffaa4fb12cf8e800c9e0f7dd6f5728a6eb832943bd711fb), uint256(0x2c413ad04136a3beb37488e87413fbafcb02f9ed8061d45c74ceca095aa4eb22));
        vk.gamma_abc[3] = G1Point(uint256(0x1aefa242d9fdd91ab5582081709fd9626e016a7ac6f07d3f0c09af88a967eb75), uint256(0x12cd5e7feb2063871f3bf298d748ada03d840d2512b400aeef6f7bcc8280fd24));
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
            Proof memory proof, uint[3] memory input
        ) public view returns (bool r) {
        uint[] memory inputValues = new uint[](3);
        
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
