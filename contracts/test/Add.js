import fs from "fs";

import { initialize } from "zokrates-js";
import { createPublicClient, http } from "viem";

import { localhost, foundry } from "viem/chains";

async function readContractState(args) {
  const deployedContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const publicClient = createPublicClient({
    chain: foundry,
    transport: http(),
  });

  const artifact = JSON.parse(fs.readFileSync("./out/add.sol/Verifier.json"));
  const abi = artifact.abi;

  const data = await publicClient.readContract({
    address: deployedContractAddress,
    abi: abi,
    functionName: "verifyTx",
    args,
  });

  return data;
}

/**
 
Expected args:

[{
  a: {
    X: bigint;
    Y: bigint;
  };
  b: {
    X: readonly [bigint, bigint];
    Y: readonly [bigint, bigint];
  };
  c: {
    X: bigint;
    Y: bigint;
  };
}, readonly [bigint, bigint, bigint, bigint]]

*/

async function generateProof() {
  const zokratesProvider = await initialize();

  console.info("generating proof...");

  const source = fs.readFileSync("./zoks/add.zok", {
    encoding: "utf8",
    flag: "r",
  });
  const artifacts = zokratesProvider.compile(source);

  const winputs = [
    [
      "326522724692461750427768532537390503835",
      "89059515727727869117346995944635890507",
    ],
    ["0", "0", "0", "0"],
    "100",
  ];

  const { witness, output } = zokratesProvider.computeWitness(
    artifacts,
    winputs
  );
  console.log("output", output);

  const pk = fs.readFileSync(`./out/keypairs/add-keypair.pk`);


  // generate proof
  const proof = zokratesProvider.generateProof(
    artifacts.program,
    witness,
    pk
  );

  console.info("proof generated!");

  return proof;
}

// const args = [
//   [
//     [
//       "0x0688731967292c44d556194327b29a2868af931c96d364c4a78cd12c21b101d3",
//       "0x072a9e4697e64455a525240dc84f9a16d4eedf441375079976e7012847ed0bfc",
//     ],
//     [
//       [
//         "0x264c34edd7d7389a573238c2af370f52ae0fe4eaeaac7e56980ed3e27a916a26",
//         "0x26e99a28f13716476563e22143110ff83821a1ad1c96c84df0c61055f6134f66",
//       ],
//       [
//         "0x03a8a8ef8b039532f6e981c1648cea9a8963cebce9017919d6d94df8e02c7674",
//         "0x2722b39abf5d16a457e7ae42d9ffeff7df7437ab4bec1cef3b1b31beaf879aa5",
//       ],
//     ],
//     [
//       "0x223cc92ba39db446edec4021cb0f10d5a1f4f603777054ebbdbe3d1bb3119734",
//       "0x08b54a43f5e118e2859c5b0db6dc91fd4d5d4601fec8094d63e7a160d149924d",
//     ],
//   ],
//   [
//     "0x0000000000000000000000000000000000000000000000000000000000000005",
//     "0x0000000000000000000000000000000000000000000000000000000000000005",
//     "0x0000000000000000000000000000000000000000000000000000000000000005",
//     "0x0000000000000000000000000000000000000000000000000000000000000005",
//   ],
// ];

const { inputs, proof } = await generateProof();

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

console.info("whatSCSays", whatSCSays);

// console.info("Read data:", data);
