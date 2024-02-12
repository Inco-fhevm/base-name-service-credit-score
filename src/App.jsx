import "./App.css";
import { useState, useEffect } from "react";
import {
  incoSigner,
  getInstance,
  incoProvider,
  getTokenSignature,
} from "./utils/fhevm";
import { toHexString } from "./utils/utils";
import { Contract } from "ethers";
import confidentialDIDABI from "./abi/confidentialDID/confidentialDIDABI";

let instance;
const CONTRACT_ADDRESS = "0x8a88B1a5814D830386029f79CC51159A3Cb2c1DE";

function App() {
  const [responseMessage, setResponseMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAbove700, setIsAbove700] = useState("Click Below");
  const [loading, setLoading] = useState("");
  const [dialog, setDialog] = useState("");
  const [encryptedData, setEncryptedData] = useState("");
  const [userCreditScore, setUserCreditScore] = useState("hidden");

  useEffect(() => {
    async function fetchInstance() {
      instance = await getInstance();
    }
    fetchInstance();
  }, []);

  const reencrypt = async () => {
    try {
      // const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        confidentialDIDABI,
        incoSigner
      );
      setLoading('Encrypting "30" and generating ZK proof...');
      setLoading("Sending transaction...");
      console.log("signer", typeof incoSigner.address);
      const result = await contract.viewOwnScore();
      setLoading("Waiting for transaction validation...");
      setLoading("");
      console.log("result", result);
      setUserCreditScore(Number(result));
    } catch (e) {
      console.log(e);
      setLoading("");
      setDialog("User score not set!");
    }
  };

  const verifyCreditScore = async () => {
    try {
      // const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS,
        confidentialDIDABI,
        incoSigner
      );
      setLoading('Encrypting "30" and generating ZK proof...');
      setLoading("Sending transaction...");
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
        <div className="flex flex-col w-1/2 p-4">
          <div className="bg-black py-10 px-10 text-left mb-6">
            <div className="text-white">
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
          </div>
          {responseMessage && (
            <p className="mb-4 text-blue-500">{responseMessage}</p>
          )}
          {errorMessage && <p className="mb-4 text-red-500">{errorMessage}</p>}
          {dialog && <div>{dialog}</div>}
          {loading && <div>{loading}</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
