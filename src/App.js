import React, { useEffect, useState } from "react";
import "./App.css";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import { ethers } from "ethers";

function App() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [chainId, setChainId] = useState(undefined);

  function onChange(e) {
    console.log(e.target.value);
  }

  // useEffect(() => {
  //   connectMetaMask();
  // }, []);

  const connectMetaMask = async () => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const _provider = await getProvider();
        const _signer = await getSigner(_provider);
        await getWalletData(_signer);
      } else {
        alert("Please install MetaMask");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProvider = async () => {
    const provider = await new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    return provider;
  };

  const getSigner = async () => {
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setSigner(signer);
    return signer;
  };

  const getWalletData = async (signer) => {
    const result = await Promise.all([
      signer.getAddress(),
      signer.getBalance(),
      signer.getChainId(),
    ]);
    console.log(result);
    setAccount(result[0]);
    setBalance(BigNumber(result[1]));
    setChainId(result[2]);
  };
  return (
    <div className="App">
      <div className="container">
        <form
          className="gradient col-lg-5 mt-5"
          style={{ borderRadius: "25px", boxShadow: "1px 1px 10px #000000" }}
        >
          <h2 style={{ color: "#FFFFFF" }}>MINTING</h2>
          <p className="blockNumber" style={{ color: "#FFFFFF" }}>
            BLOCK NUMBER:
          </p>
          <p className="mintStartBlockNumber" style={{ color: "#FFFFFF" }}>
            MIINT START BLOCKNUMBER: #
          </p>
          <p className="mintLimitPerBlock" style={{ color: "#FFFFFF" }}>
            MINT LIMIT PER BLOCK:
          </p>
          <div
            className="card"
            id="wallet-address"
            style={{ marginTop: "3px", boxShadow: "1px 1px 4px #000000" }}
          >
            <h2>MY WALLET</h2>
            <Button
              variant="secondary"
              size="lg"
              active
              onClick={connectMetaMask}
            >
              Connect MetaMask
            </Button>
            <p>YOUR ADDRESS :{account} </p>
            <p>YOUR BALANCE :{balance} </p>
          </div>
          <div>
            <h2 style={{ color: "#FFFFFF" }}>MINT</h2>
            <p style={{ color: "#FFFFFF" }}></p>
            <label style={{ color: "#FFFFFF" }}>MINT AMOUNT : 3</label>
            <p>
              <input
                type="number"
                name="amount"
                min="1"
                max="3"
                onChange={onChange}
              />
            </p>
            <Button variant="secondary" size="lg" active>
              Mint/Buy
            </Button>{" "}
            <br />
            <br />
            <p className="mintPrice" style={{ color: "#FFFFFF" }}>
              MINT PRICE : ETH
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
