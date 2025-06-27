import deployed from "../../../deployments/localhost/Craze.json" with {type: "json"};
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import { ethers } from "ethers";
import "./App.css";
import "./style.css";
import "./css/App.css";
import { isAddress } from "ethers/src.ts/utils";

function App() {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const userAddr = accounts[0];
        
        /**
         * this line calls the sign in function (connecting the wallet)
        */
       const provider = new ethers.providers.Web3Provider(window.ethereum);
       const signer = await provider.getSigner();
       
       console.log("Connected to MetaMask account: ", userAddr);
       // console.log(
        //   "Signer address form MetaMask: ",
        //   await signer.getAddress() //this is the same signer as the one using the website at the front, essentially the currently active metamask acc.
        // );
        
        if (connectWallet) {
          var connectBtn = document.getElementById("connect");
          connectBtn.textContent = "Done ✓";
          var connectInfo = document.querySelector(".connectInfo");
          connectInfo.textContent = "Connected to: " + userAddr;
        }
      } catch (err) {
        console.error("Error connecting to MetaMask: ", err);
        var connectBtn = document.getElementById("connect");
        connectBtn.textContent = "Error!";
        var connectInfo = document.querySelector(".connectInfo");
        connectInfo.textContent = "Error connecting to MetaMask!";
      }
    } else {
      console.warn("Metamask is not installed.");
      var connectBtn = document.getElementById("connect");
      connectBtn.textContent = "MetaMask not installed!";
      // const connectDiv = document.querySelector(".connect-button");
      connectBtn.classList.add("metamask-not-installed");
      var connectInfo = document.querySelector(".connectInfo");
      connectInfo.textContent = "Please install MetaMask first!";
    }

    await initEthers();
  };
  
  //importing important info
  const contractAddress = deployed.address;
  const contractABI = deployed.abi;


  //initialising the contract instance 
  let provider;
  let signer;
  var contract;

  async function initEthers(){
    if(!window.ethereum) {
      alert('Please install Metmask!');
      console.log('Metamask not found.');
    }
    const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
    if(accounts.length===0){
      console.warn('please connect the wallet first.');
      return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer); //can use 'contract' as the instantiation to call functions now

    console.log('Contract initialised: ', contract.address);
    if (initEthers) {
      var connectBtn = document.getElementById("connect");
      connectBtn.textContent = "Done ✓";
      var connectInfo = document.querySelector(".connectInfo");
      connectInfo.textContent = "Connected to: " + accounts[0];
    }
  }

  function contractCheck() {
    if(!contract) {
      console.warn('Contract not initialised. Please connect wallet first.');
      return false;
    }
    return true;
  }

  
  //always checks and instantiates the contract on page reload.
  window.addEventListener('load', async () => {
    await initEthers();
    await getContractInfo();
  });
  
  async function owner() {
    if(contractCheck()) {
      try {
        const owner = await contract.owner();
        console.log('Contract owner: ', owner);
        alert('Contract owner: '+ owner);
      } catch (err) {
        console.log('Unable to fetch owner: ',err);
      }
    }
  }

  async function remainingMintableSupply () {
    if(contractCheck()) {
      try {
        const supply = await contract.remainingMintableSupply();
        console.log('Remaining mintable supply: ', supply.toString());
        alert('Remaining mintable supply: ' + supply.toString());
      } catch (err) {
        console.log('Error: ', err);
      }
    }
  }
  
  async function capF() {
    if(contractCheck()) {
      try {
        const cap = await contract.cap();
        console.log('Supply Cap: ', cap.toString());
        alert('Supply Cap: ' + cap.toString());
      } catch (err){
        console.log('Error: ', err);
      }
    }
  }
  
  async function mintingPaused() {
    if(contractCheck()) {
      try {
        const x = await contract.mintingPaused();
        console.log('Minting Paused: ', x);
        alert('Minting Paused: ' + x);
      } catch (err){
        console.log('Error: ', err);
      }
    }
  }
  
  async function isDestroyed() {
    if(contractCheck()) {
      try {
        const x = await contract.isDestroyed();
        console.log('Contract Destroyed: ', x);
        alert('Contract Destroyed: ' + x);
      } catch (err){
        console.log('Error: ', err);
      }
    }
  }
  
  async function contractPaused(){
    if(contractCheck()) {
      try {
        const x = await contract.contractPaused();
        console.log('Contract Paused: ', x);
        alert('Contract Paused: ' + x);
      } catch (err){
        console.log('Error: ', err);
      }
    }
  }
  
  
  async function getContractInfo() {
    if(contractCheck()){
      try{
        const [
          name,
          symbol,
          decimals,
          totalSupply,
          cap,
          mintableSupply,
          mintingPaused,
          contractDestroyed
        ] = await contract.getContractInfo();
        
        // Log the data (for debugging).
        // In your React component, you'd typically use 'setState' here
        // to update your component's state and render the info in the UI.
        console.log({
          name,
          symbol,
          decimals: decimals.toString(),
          totalSupply: totalSupply.toString(),
          cap: cap.toString(),
          mintableSupply: mintableSupply.toString(),
          mintingPaused,
          contractDestroyed
        });
        document.querySelector(".contract-info").textContent = "Name: " + name + "\nSymbol: " + symbol + "\nDecimals: "+ decimals.toString() + "\nTotal Supply: "+ totalSupply.toString() +
        "\nSupply Cap: "+ cap.toString() + "\nmintableSupply: " + mintableSupply.toString() + "\nminting paused: " + mintingPaused + "\nContract destroyed" + contractDestroyed;
      } catch(err){
        console.log('Action failed: ', err);
      }
    }
  }
  
  
  async function getUserInfo() {
    const addr = document.getElementById("info-inputs").value.trim();
    if(contractCheck()){
      try{
        if(!ethers.utils.isAddress(addr)) {
          alert('Invalid address.');
          return;
        }
        const [
          balance,
          allowance ] = await contract.getUserInfo(addr);
    
        // Log the data (for debugging).
        // In your React component, you'd typically use 'setState' here
        // to update your component's state and render the info in the UI.
        console.log({
          balance: balance.toString(),
          allowance: allowance.toString()
        });
      } catch(err){
        console.log('Action failed: ', err);
      }
    }


  }

  return (
    <>
      <div className="bg-img">
        <div className="blur-bg"></div>
      </div>
      <div className="center-wrap">
        <div className="container">
          <div id="blank"></div>
          <div className="title">
            <div className="heading">
              <span id="head-style">Crazy Contract</span>
            </div>
            <div className="contract-info">
              <p>The contract info is present here.</p>
            </div>
            <div className="connect-button">
              <button id="connect" onClick={connectWallet}>
                Connect
              </button>
              <p className="connectInfo">Connected Address: null</p>
            </div>
          </div>

          <div id="contract-info" className="account-info">
            <p>
              Here Account info will be shown, Basically, info from
              getUserInfo()
            </p>
            <ul>
              <li>public key</li>
              <li>account balance</li>
              <li>allowance</li>
            </ul>
          </div>
          <div className="contract-options">
            <div className="info-options info-txt">
              <p>Info Options:</p>
              <div id="info-button-wrapper">
                <button id="getUserInfo" onClick={getUserInfo} className="info-buttons">
                  Get User Info
                </button>
                <input
                  type="text"
                  placeholder=" Give User Address"
                  id="info-inputs"
                  className="inputs"
                />
              </div>
            </div>
            <div className="erc-options erc-txt">
              {/** 
            standard functions are:
            1. transfer
            2. transferfrom
            3. approve
            4. allowance
            5. balanceof
            6. totalsupply
            7. decimals
            8. name
            9. symbol
            */}
              <p>Standard ERC20 functions:</p>

              <div id="erc-button-wrapper">
                <button id="transfer" className="erc-buttons">
                  Transfer
                </button>
                <button id="transferFrom" className="erc-buttons">
                  Transfer from
                </button>
                <button id="approve" className="erc-buttons">
                  Approve
                </button>
                <button id="allowance" className="erc-buttons">
                  Allowance
                </button>
                <button id="balanceOf" className="erc-buttons">
                  Balance of
                </button>
                <button id="totalSupply" className="erc-buttons">
                  Total supply yet?
                </button>
                <button id="decimals" className="erc-buttons">
                  Decimals
                </button>
                <button id="name" className="erc-buttons">
                  Contract Name
                </button>
                <button id="symbol" className="erc-buttons">
                  Contract Symbol
                </button>
              </div>
            </div>
            <div className="admin-options admin-txt">
              {/** 
            admin options are:
            1. transferOwnership
            2. renounceOwnership
            3. owner
             */}
              <p>
                Admin Options <em>ALERT!</em> :
              </p>
              <div id="admin-button-wrapper">
                <button id="transferOwnership" className="admin-buttons">
                  Transfer
                </button>
                <button id="renounceOwnership" className="admin-buttons">
                  Renounce Contract
                </button>
                <button id="owner" onClick={owner} className="admin-buttons">
                  Who owns this?
                </button>
              </div>
            </div>
            <div className="mint-options mint-txt">
              {/** 
            mint options are:
            1. mint
            2. cap
            3. pauseMinting
            4. unauseMinting
            5. mintingPaused
            6. remainingMintableSupply
            */}
              <p>
                Mint some tokens <em>OWNER only</em>:
              </p>
              <div id="mint-button-wrapper">
                <button id="mint" className="mint-buttons">
                  Mint
                </button>
                <button id="pauseMinting" className="mint-buttons">
                  Pause minting
                </button>
                <button id="unpauseMinting" className="mint-buttons">
                  Unpause Minting
                </button>
                <button id="mintingPaused" onClick={mintingPaused} className="mint-buttons">
                  Is minting paused?
                </button>
                <button id="cap" onClick={capF} className="mint-buttons">
                  What's the max?
                </button>
                <button id="remainingMintableSupply" onClick={remainingMintableSupply} className="mint-buttons">
                  Remaining Capacity
                </button>
              </div>
            </div>
            <div className="burn-options burn-txt">
              {/** 
            1. burn
            2. burnFrom
             */}
              <p>Burn some tokens:</p>
              <div id="burn-button-wrapper">
                <button id="burn" className="burn-buttons">
                  Burn mine
                </button>
                <button id="burnFrom" className="burn-buttons">
                  Burn from
                </button>
              </div>
            </div>
            <div className="emergency-options emergency-txt">
              {/** 
            emergency functions:
            1. emergencyPause
            2. unpause
            3. contractPaused 
            */}
              <p>Emergency Options:</p>
              <div id="emergency-button-wrapper">
                <button id="emergencyPause" className="emergency-buttons">
                  Wait, Pause!
                </button>
                <button id="unpause" className="emergency-buttons">
                  Go on, unpause.
                </button>
                <button id="contractPaused" onClick={contractPaused} className="emergency-buttons">
                  Is this Paused??
                </button>
              </div>
            </div>
            <div className="destroy-options destroy-txt">
              {/** Destroy options will have the following buttons:
             1. proposeDestruction
             2. cancelDestruction
             3. executeDEstruction
             4. isDestroyed
              */}
              <p>Destroy:</p>
              <div id="destruction-buttons-wrapper">
                <button id="proposeDestruction" className="destruction-buttons">
                  Propose Destruction
                </button>
                <button id="cancelDestruction" className="destruction-buttons">
                  Cancel Destruction
                </button>
                <button id="executeDestruction" className="destruction-buttons">
                  Destroy Now!
                </button>
                <button id="isDestroyed" onClick={isDestroyed} className="destruction-buttons">
                  Is this destroyed?
                </button>
              </div>
            </div>
            <div className="recovery-options recovery-txt">
              {/** 
            1. recoverERC20
            2. recoverETH
             */}
              <p>
                Recovery options <em>Owner only</em>:
              </p>
              <div id="recovery-button-wrapper">
                <button id="recoverERC20" className="recovery-buttons">
                  Recover my tokens.
                </button>
                <button id="recoverETH" className="recovery-buttons">
                  Recover my ETH.
                </button>
              </div>
            </div>
            <div className="test-block">
              <p>Testing out MetaMask connections:</p>
              <button id="test-button">Try Now</button>
            </div>
            <input className="c-checkbox" type="checkbox" id="checkbox" />
            <div className="c-formContainer">
              <form className="c-form" action="">
                <input
                  className="c-form__input"
                  placeholder="E-mail"
                  type="email"
                  pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,63}$"
                  required
                />
                <label className="c-form__buttonLabel" htmlFor="checkbox">
                  <button className="c-form__button" type="button">
                    Send
                  </button>
                </label>
                <label
                  className="c-form__toggle"
                  htmlFor="checkbox"
                  data-title="Notify me"
                ></label>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
