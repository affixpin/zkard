export const generateNewSecretKey = () => {
    return generatePrivateKey();
};

export const getWallet = (sk) => {
  const account = privateKeyToAccount(sk);
  const client = createWalletClient({
    chain: mainnet,
    transport: http(),
    account: account,
  });
  return wallet
}




let verifier = new web3.eth.Contract(abi, address, {
    from: accounts[0], // default from address
    gasPrice: '20000000000000'; // default gas price in wei
});

let result = await verifier.methods
    .verifyTx(proof.proof, proof.inputs)
    .call({ from: accounts[0] });