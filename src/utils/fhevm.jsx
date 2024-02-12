import { Wallet, BrowserProvider, JsonRpcProvider } from "ethers";
import { initFhevm, createInstance } from "fhevmjs";
export const init = async () => {
  await initFhevm();
};

// From https://github.com/zama-ai/fhevmjs/blob/c4b8a80a8783ef965973283362221e365a193b76/bin/fhevm.js#L9
const FHE_LIB_ADDRESS = "0x000000000000000000000000000000000000005d";

export const incoProvider = new JsonRpcProvider(`https://testnet.inco.org`);
export const incoSigner = new Wallet(
  "0x92293977156de6e03b20b26708cb4496b523116190b5c32d77cee8286d0c41f6",
  incoProvider
);

let instance;

export const createFhevmInstance = async () => {
  const network = await incoProvider.getNetwork();
  const chainId = +network.chainId.toString();
  // Get blockchain public key
  const ret = await provider.call({
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

export const getTokenSignature = async (contractAddress, userAddress) => {
  // const instance = await createInstance({ chainId, publicKey });
  const { publicKey, token } = instance.generateToken({
    verifyingContract: contractAddress,
  });
  const params = [userAddress, JSON.stringify(token)];
  const signature = await window.ethereum.request({
    method: "eth_signTypedData_v4",
    params,
  });
  instance.setTokenSignature(contractAddress, signature);
  return { signature, publicKey };
};
