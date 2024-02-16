import { Wallet, JsonRpcProvider, AbiCoder, BrowserProvider } from "ethers";
import { initFhevm, createInstance } from "fhevmjs";

import { CONTRACT_ADDRESS } from "../App";

export const init = async () => {
  await initFhevm();
};

// TFHE.sol contract address
// From https://github.com/zama-ai/fhevmjs/blob/c4b8a80a8783ef965973283362221e365a193b76/bin/fhevm.js#L9
const FHE_LIB_ADDRESS = "0x000000000000000000000000000000000000005d";

export const incoProvider = new JsonRpcProvider('https://testnet.inco.org');
export const incoSigner = new Wallet(
  // Hardcoding private key for demo purposes
  // address: 0x77bBaCae5385AAf756A7Adbbd04dcB608dcA8EA9
  "0x92293977156de6e03b20b26708cb4496b523116190b5c32d77cee8286d0c41f6",
  incoProvider
);

let instance;

export const createFhevmInstance = async () => {
  const network = await incoProvider.getNetwork();
  const chainId = +network.chainId.toString();
  // Get blockchain public key
  const ret = await incoProvider.call({
    to: FHE_LIB_ADDRESS,
    // first four bytes of keccak256('fhePubKey(bytes1)') + 1 byte for library
    data: "0xd9d47bb001",
  });
  const decoded = AbiCoder.defaultAbiCoder().decode(["bytes"], ret);
  const publicKey = decoded[0];
  instance = await createInstance({ chainId, publicKey });
};

export const getInstance = async () => {
  await init();
  await createFhevmInstance();
  return instance;
};

export const getPublicKey = async (instance) => {
  const eip712Domain = {
    // This defines the network, in this case, Mainnet.
    chainId: 9090,
    // Give a user-friendly name to the specific contract you're signing for.
    name: 'Authorization token',
    // // Add a verifying contract to make sure you're establishing contracts with the proper entity.
    verifyingContract: CONTRACT_ADDRESS,
    // This identifies the latest version.
    version: '1',
  }

  if (!instance.hasKeypair(CONTRACT_ADDRESS)) {
    const reencryption = instance.generatePublicKey(eip712Domain);
   
    // If using a BrowserProvider like MetaMask, you can use the following code to sign the message:
    //
    // const params = [userAddress, JSON.stringify(reencryption.eip712)];
    // const sig = window.ethereum.request({
    //   method: "eth_signTypedData_v4",
    //   params,
    // });

    // Here we are using our hardcoded wallet instead.
    const sig = await incoSigner.signTypedData(
      reencryption.eip712.domain,
      {Reencrypt: reencryption.eip712.types.Reencrypt},
      reencryption.eip712.message
    )
    
    instance.setSignature(CONTRACT_ADDRESS, sig);
  }

  return instance.getPublicKey(CONTRACT_ADDRESS);
};
