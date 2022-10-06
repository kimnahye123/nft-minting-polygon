import React, { useEffect, useState } from "react";
import "./App.css";
import chainIds from "./chainIds.js";
import { ABI, ADDRESS } from "./config.js";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import Web3 from "web3";

function App() {
  const [provider, setProvider] = useState(undefined);
  const [signer, setSigner] = useState(undefined);
  const [amount, setAmount] = useState(0); //amount >0 amount<= limitPerBlock
  const [account, setAccount] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [chainId, setChainId] = useState(undefined);
  const [nowblock, setNowblock] = useState(undefined);
  const [startBlock, setstartBlock] = useState(undefined);
  const [totalmint, setTotalmint] = useState(undefined);

  useEffect(() => {
    try {
      componentMount();
      getMintBlock();
    } catch (error) {
      console.log(error);
    }
  }, []); //useEffect 다시 확인

  const getBlockNumber = async () => {
    let web3 = new Web3(window.ethereum);
    const blockNumber = await web3.eth.getBlockNumber();
    setNowblock(blockNumber);
  };

  const getMintBlock = async () => {
    let web3 = new Web3(window.ethereum);
    let contract = await new web3.eth.Contract(ABI, ADDRESS);
    await contract.methods
      .getStartMintBlock()
      .call()
      .then((result) => {
        setstartBlock(result);
      });
  };

  function componentMount() {
    setInterval(() => {
      getBlockNumber();
    }, 15000);
  }

  //수량 입력받기. 최대 3개
  function onChange(e) {
    setAmount(e.target.value);
    console.log(e.target.value);
  }

  //메타마스크 연결.
  //윈도우에 메마 없으면 install 요청
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

  //web3에서 제공하는 provider 쓸 수 있게 provider에 넣어두기
  const getProvider = async () => {
    const provider = await new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    return provider;
  };

  //provider로 sign 요청 할 수 있음
  //sign 요청기능
  const getSigner = async (provider) => {
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    setSigner(signer);
    return signer;
  };

  //wallet 연결 후 데이터 promise 로 가져오기
  const getWalletData = async (signer) => {
    const result = await Promise.all([
      signer.getAddress(),
      signer.getBalance(),
      signer.getChainId(),
    ]);
    console.log(result[1]);
    setAccount(result[0]);
    setBalance(Number(ethers.utils.formatEther(result[1])));
    setChainId(result[2]);
  };

  async function publicMint() {
    if (chainId === 1) {
      console.log("메인넷");
    } else if (chainId === 5) {
      console.log("Goerli");
    } else {
      alert("Error: 네트워크가 연결되지 않았습니다.");
      return;
    }
    if (!account) {
      alert("Error: 지갑을 연결해주세요");
      return;
    }

    let web3 = new Web3(window.ethereum);
    let contract = await new web3.eth.Contract(ABI, ADDRESS);
    console.log(contract);
    let mintRate = Number(await contract.methods.cost().call());
    let total = await contract.methods.totalSupply().call();
    setTotalmint(total);
    let totalAmount = BigNumber(amount * mintRate);
    if (amount <= 0 || amount > 3) {
      alert("3개까지만 욕심쟁이야");
      return;
    }
    if (nowblock <= startBlock) {
      alert("시간이 안됐다");
      return;
    }
    try {
      const result = contract.methods.mint(account, amount).send({
        from: account,
        value: String(totalAmount),
      });

      if (result != null) {
        console.log(result);
        alert("민팅에 성공하였습니다");
      }
    } catch (error) {
      console.log(error);
      alert("민팅에 실패하였습니다.");
    }
  }
  return (
    <div className="App">
      <div className="container">
        <form
          className="gradient col-lg-5 mt-5"
          style={{ borderRadius: "25px", boxShadow: "1px 1px 10px #000000" }}
        >
          <h2 style={{ color: "#FFFFFF" }}>MINTING</h2>
          <p className="blockNumber" style={{ color: "#FFFFFF" }}>
            BLOCK NUMBER: {nowblock}
          </p>
          <p className="mintStartBlockNumber" style={{ color: "#FFFFFF" }}>
            MIINT START BLOCKNUMBER: # {startBlock}
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
            <br />
            <p>YOUR ADDRESS :{account} </p>
            <p>YOUR BALANCE :{balance} ETH </p>
            <p>NETWORK : </p>
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
                max="4"
                onChange={onChange}
              />
            </p>
            <Button variant="secondary" size="lg" active onClick={publicMint}>
              Mint/Buy
            </Button>{" "}
            <br />
            <br />
            <p className="mintPrice" style={{ color: "#FFFFFF" }}>
              {totalmint}/1000 <br />
              MINT PRICE :ETH
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
