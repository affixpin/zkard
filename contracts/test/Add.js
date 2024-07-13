import fs from "fs";

import { initialize } from "zokrates-js";
import { createPublicClient, http } from "viem";

import { localhost, foundry } from "viem/chains";
import { sha256 } from 'viem'

async function readContractState(args) {
  const deployedContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(),
  });

  const artifact = JSON.parse(fs.readFileSync("./out/borrow.sol/Verifier.json"));
  const abi = artifact.abi;

  const data = await publicClient.readContract({
    address: deployedContractAddress,
    abi: abi,
    functionName: "verifyTx",
    args,
  });

  return data;
}


async function generateProof(prev_state_hash, prev_state, to_add) {
  const zokratesProvider = await initialize();

  console.info("generating proof...");

  const source = fs.readFileSync("./zoks/borrow.zok", {
    encoding: "utf8",
    flag: "r",
  });
  const artifacts = zokratesProvider.compile(source);

  const winputs = [
    numArrayToStrArray(hashToZkInts(prev_state_hash)),
    numArrayToStrArray(prev_state),
    to_add.toString(),
  ];

  const { witness, output } = zokratesProvider.computeWitness(
    artifacts,
    winputs
  );
  console.log("output", output);

  const pk = fs.readFileSync(`./out/keypairs/borrow-keypair.pk`);


  // generate proof
  const proof = zokratesProvider.generateProof(
    artifacts.program,
    witness,
    pk
  );

  console.info("proof generated!");

  return proof;
}

const hashPartToBigInt16 = (hashPart) => {
  return BigInt("0x" + hashPart);
}


const hashToZkInts = (hash) => {
  const hashNo0x = hash.slice(2);
  const hashPart1 = hashPartToBigInt16(hashNo0x.slice(0, 32));
  const hashPart2 = hashPartToBigInt16(hashNo0x.slice(32, 64));
  return [hashPart1, hashPart2];

}

const padNum = (num) => {
  const hexNum = num.toString(16);
  const paddedNum = hexNum.padStart(16, '0');

  return paddedNum;
}

const numArrayToStrArray = (numArray) => {
  return numArray.map((num) => num.toString());
}

const stateToByteStr = (state) => {
  const state0Hex = padNum(state[0]);
  const state1Hex = padNum(state[1]);
  const state2Hex = padNum(state[2]);
  const state3Hex = padNum(state[3]);

  const totalStateHex = state0Hex + state1Hex + state2Hex + state3Hex;
  return totalStateHex;
}

const { inputs, proof } = await generateProof(prev_state_hash, [0,0,0,0], 100);

console.info("inputs", inputs);
console.info("proof", proof);

const args = [
  {
    a: {
      X: BigInt(proof.a[0]),
      Y: BigInt(proof.a[1]),
    },
    b: {
      X: [BigInt(proof.b[0][0]), BigInt(proof.b[0][1])],
      Y: [BigInt(proof.b[1][0]), BigInt(proof.b[1][1])],
    },
    c: {
      X: BigInt(proof.c[0]),
      Y: BigInt(proof.c[1]),
    },
  },
  inputs.map((el) => BigInt(el)),
];

console.info("args", args);

console.log("verifying proof on a smartcontract...");

const whatSCSays = await readContractState(args);

console.info("what SC says", whatSCSays);

// console.info("Read data:", data);
