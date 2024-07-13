import { initialize } from "zokrates-js";
import fs from "fs";

const formAddPayload = (prev_state_hash, prev_state, to_add) => {
  const psh1 = BigInt("0x" + prev_state_hash.slice(0, 16));
  const psh2 = BigInt("0x" + prev_state_hash.slice(16));

  // Rest of the code...
};

initialize().then((zokratesProvider) => {
  const names = ["borrow", "can_liquidate"];

  for (const name of names) {
    const source = fs.readFileSync(`zoks/${name}.zok`, {
      encoding: "utf8",
      flag: "r",
    });

    const artifacts = zokratesProvider.compile(source);

    const keypair = zokratesProvider.setup(artifacts.program);

    const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);

    if (!fs.existsSync('./src/verifiers')) {
      fs.mkdirSync('./src/verifiers');
    }
    fs.writeFileSync(`./src/verifiers/${name}.sol`, verifier);

    console.log(`Verifier for ${name} generated`);

    if (!fs.existsSync('./out/keypairs')) {
      fs.mkdirSync('./out/keypairs');
    }

    fs.writeFileSync(`./out/keypairs/${name}-keypair.pk`, Buffer.from(keypair.pk));
    fs.writeFileSync(`./out/keypairs/${name}-keypair.vk`, JSON.stringify(keypair.vk));
  }

  return zokratesProvider;
});
