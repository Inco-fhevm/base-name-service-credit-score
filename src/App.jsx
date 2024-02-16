import "./App.css";
import { useState, useEffect } from "react";
import { Buffer } from 'buffer';

import {
  incoSigner,
  getInstance,
  getPublicKey,
} from "./utils/fhevm";
import { Contract } from "ethers";
import confidentialDIDABI from "./abi/confidentialDID/confidentialDIDABI.json";

let instance;
export const CONTRACT_ADDRESS = "0x843bB5438CB0f9212B5B60b0174d4b7396F5bE9d";

function App() {
  const [isAbove700, setIsAbove700] = useState("Click Below");
  const [loading, setLoading] = useState("");
  const [dialog, setDialog] = useState("");
  const [userCreditScore, setUserCreditScore] = useState("hidden");

  useEffect(() => {
    async function fetchInstance() {
      instance = await getInstance();
    }
    fetchInstance();
  }, []);

  const reencrypt = async () => {
    setLoading('');
    setDialog('');
    try {
      const contract = new Contract(
        CONTRACT_ADDRESS,
        confidentialDIDABI,
        incoSigner
      );
      setLoading("Sending transaction...");
      console.log("signer", incoSigner.address);
      const reencryption = await getPublicKey(instance);
      const encryptedResult = await contract.viewOwnScore(reencryption.publicKey, reencryption.signature);
      setLoading("Waiting for transaction validation...");
      setLoading("");
      console.log("result", encryptedResult);
      window.Buffer = Buffer;
      const result = await instance.decrypt(CONTRACT_ADDRESS, encryptedResult);
      setUserCreditScore(Number(result));
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("User score not set!");
    }
  };

  const verifyCreditScore = async () => {
    setLoading('');
    setDialog('');
    try {
      // const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        confidentialDIDABI,
        incoSigner
      );
      setLoading('Encrypting "30" and generating ZK proof...');
      setLoading("Querying contract...");
      console.log("signer", typeof incoSigner.address);
      const result = await contract.isUserScoreAbove700(incoSigner.address);
      setLoading("Waiting for transaction validation...");
      setLoading("");
      setIsAbove700(result.toString());
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("User score not set!");
    }
  };

  return (
    <div className="mt-5">
      <div className="flex flex-col text-center justify-center items-center mb-10 mt-10">
        <img src={"/band.svg"} alt="Band" />
        <h1 className="my-10 text-2xl font-bold text-black">
          Confidential DID
        </h1>
        <img src={"/band.svg"} alt="Band" />
      </div>
      <div className="flex flex-row">
        <div className="flex flex-col p-4">
          <div className="bg-black py-10 px-10 text-left mb-6 text-center">
            <h2>Your address: {incoSigner.address} (hardcoded for this Dapp)</h2>
            <div className="mt-10 text-white">
              Your Credit Score:{" "}
              <span className="text-custom-green">{userCreditScore}</span>
            </div>
            <button
              className="bg-gray-200 hover:bg-blue-400 text-black font-bold py-2 px-4 rounded mb-8"
              onClick={reencrypt}
            >
              Decrypt Own Credit Score
            </button>
            <div className="text-white">
              Is your score above 700?:{" "}
              <span className="text-custom-green">{isAbove700}</span>
            </div>
            <button
              className="bg-gray-200 hover:bg-blue-400 text-black font-bold py-2 px-4 rounded mb-8"
              onClick={verifyCreditScore}
            >
              Verify without decrypting
            </button>
            {loading && <div>{loading}</div>}
            {dialog && <div>{dialog}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
