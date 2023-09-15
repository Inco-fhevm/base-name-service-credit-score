import { Wallet, BrowserProvider, JsonRpcProvider } from "ethers";
import { initFhevm, createInstance } from "fhevmjs";
export const init = async () => {
  await initFhevm();
};

export const incoProvider = new JsonRpcProvider(`https://evm-rpc.inco.network`);
export const incoSigner = new Wallet(
  "0x92293977156de6e03b20b26708cb4496b523116190b5c32d77cee8286d0c41f6",
  incoProvider
);

let instance;

export const createFhevmInstance = async () => {
  const network = await incoProvider.getNetwork();
  const chainId = +network.chainId.toString();
  const publicKey = await incoProvider.call({
    from: null,
    to: "0x0000000000000000000000000000000000000044",
  });
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
