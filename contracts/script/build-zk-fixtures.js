import { initialize } from "zokrates-js";
import fs from "fs";

const formAddPayload = (prev_state_hash, prev_state, to_add) => {
  const psh1 = BigInt("0x" + prev_state_hash.slice(0, 16));
  const psh2 = BigInt("0x" + prev_state_hash.slice(16));
}

initialize().then((zokratesProvider) => {

    const names = ["add", "can_liquidate"]

    for (const name of names) {
        const source = fs.readFileSync(`zoks/${name}.zok`, { encoding: 'utf8', flag: 'r' });

        const artifacts = zokratesProvider.compile(source);

        const winputs = [
          [
            "326522724692461750427768532537390503835","89059515727727869117346995944635890507"
          ],
          [
            "0", "0", "0", "0"
          ],
          "100"
        ]
      
        const { witness, output } = zokratesProvider.computeWitness(artifacts, winputs);
        console.log("output", output);
    
        const keypair = zokratesProvider.setup(artifacts.program);

        // generate proof
        const proof = zokratesProvider.generateProof(
          artifacts.program,
          witness,
          keypair.pk
        );
        console.log("proof", proof);
      
        const verifier = zokratesProvider.exportSolidityVerifier(keypair.vk);
        fs.writeFileSync(`./src/${name}.sol`, verifier);

        console.log(`Verifier for ${name} generated`);
    }


    return zokratesProvider;
})
  