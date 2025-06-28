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
  
  //info options
  
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

  //erc20 standard functions

  const transfer = async () => {
    if(contractCheck()){
      const addr = document.getElementById("erc-transfer-inputs").value.trim();
      const amt = document.getElementById("erc-amount1-inputs").value.trim();
      if(!ethers.utils.isAddress(addr)) {
        alert('Invalid Address!.');
        return;
      }
      if(amt===''||isNaN(amt)||parseFloat(amt)<=0){
        alert('Please enter a valid amount to transfer.');
        return;
      }
      try {
        const tx = await contract.transfer(addr, amt);
        console.log('Transferred '+ amt + ' tokens to ' + addr + ', id: '+tx.hash);
        await tx.wait();
        alert('Action Successful!');
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }

  const transferFrom = async () => {
    if(contractCheck()){
      const addr1 = document.getElementById("transferfrom-from-inputs").value.trim();
      const addr2 = document.getElementById("transferfrom-to-inputs").value.trim();
      const amt = document.getElementById("erc-amount2-inputs").value.trim();
      if(!ethers.utils.isAddress(addr1) || !ethers.utils.isAddress(addr2)) {
        alert('Invalid Address!.');
        return;
      }
      if(amt===''||isNaN(amt)||parseFloat(amt)<=0){
        alert('Please enter a valid amount to transfer.');
        return;
      }
      try {
        const tx = await contract.transferFrom(addr1,addr2, amt);
        console.log('Transferred '+ amt + ' tokens to ' + addr2 + ' from ' + addr1 +' , id: '+tx.hash);
        await tx.wait();
        alert('Action Successful!');
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }
  const approve = async () => {
    if(contractCheck()){
      const spender = document.getElementById("approve-spender-inputs").value.trim();
      const amt = document.getElementById("approve-amount-inputs").value.trim();
      if(!ethers.utils.isAddress(spender)) {
        alert('Invalid address.');
        return;
      }
      if(amt === ''|| isNaN(amt)||parseFloat(amt)<=0){
        alert('Please enter a valid amount to approve.');
        return;
      }
      try {
        const tx = await contract.approve(spender, amt);
        console.log('Spender ' + spender + ' is approved of amount: ' + amt +', id: '+tx.hash);
        alert('Spender ' + spender + ' is approved of amount: ' + amt +', id: '+tx.hash);
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }
  const allowance = async () => {
    if(contractCheck()){
      const owner = document.getElementById("allowance-owner-inputs").value.trim();
      const spender = document.getElementById("allowance-spender-inputs").value.trim();
      if(!ethers.utils.isAddress(owner) || !ethers.utils.isAddress(spender)) {
        alert('Invalid address.');
        return;
      }
      try {
        const tx = await contract.allowance(owner, spender);
        console.log('Allowance of ' + spender + ' by ' + owner + ' is: ' + tx);
        alert('Allowance of ' + spender + ' by ' + owner + ' is: ' + tx);
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }
  const balanceOf = async () => {
    if(contractCheck()){
      const addr = document.getElementById("balanceof-account-inputs").value.trim();
      if(!ethers.utils.isAddress(addr)) {
        alert('Invalid address.');
        return;
      }
      try {
        const tx = await contract.balanceOf(addr);
        console.log('Balance of ' + addr + 'is : '+ tx);
        alert('Balance of ' + addr + 'is : '+ tx);
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }
  const totalSupply = async () => {
    if(contractCheck()){
      try {
        const tx = await contract.totalSupply();
        console.log('Total Supplied: ', tx);
        alert('Total Supplied: ' + tx);
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }
  const decimals = async () => {
    if(contractCheck()){
      try {
        const tx = await contract.decimals();
        console.log('Decimals: ', tx);
        alert('Decimals: ' + tx);
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }
  const name = async () => {
    if(contractCheck()){
      try {
        const tx = await contract.name();
        console.log('Contract Name: ', tx);
        alert('Contract Name: ' + tx);
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }
  const symbol = async () => {
    if(contractCheck()){
      try {
        const tx = await contract.symbol();
        console.log('Contract Symbol: ', tx);
        alert('Contract Symbol: ' + tx);
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }


  //admin buttons
  const transferOwnership = async() => {
    if(contractCheck()) {
      const addr = document.getElementById("admin-inputs").value.trim();
      if(!ethers.utils.isAddress(addr)) {
        alert('Invalid address.');
        return;
      }
      try {
        const tx = await contract.transferOwnership(addr);
        console.log("Ownership Transferred, id: "+tx.hash);
        await tx.wait();
        alert('Action Successful!');
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }

  const renounceOwnership = async() => {
    if(contractCheck()) {
      try {
        const tx = await contract.renounceOwnership();
        console.log("Ownership Renounced, id: "+tx.hash);
        await tx.wait();
        alert('Action Successful!');
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }

  const owner = async () => {
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
  
  //mint buttons
  const mint = async () => {
    if(contractCheck()) {
      const addr = document.getElementById("mint-address-inputs").value.trim();
      const amt = document.getElementById("mint amount-inputs").value.trim();
      if(!ethers.utils.isAddress(addr)) {
        alert('Invalid address.');
        return;
      }
      if(amt === '' || isNaN(amt) || parseFloat(amt) <= 0) {
        alert('Please enter a valid amount to mint.');
        return;
      }
      try {
        const tx = await contract.mint(addr, amt);
        console.log("Minted tokens to "+addr+", id: "+tx.hash);
        await tx.wait();
        alert('Action Successful!');
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }

  const pauseMinting = async () => {
    if(contractCheck()) {
      try {
        const tx = await contract.pauseMinting();
        console.log("Minting Paused, id: "+tx.hash);
        await tx.wait();
        alert('Action Successful!');
      } catch (error) {
        console.log('Error: ', error);
        
      }
    }
  }
  const unpauseMinting = async () => {
    if(contractCheck()) {
      try {
        const tx = await contract.unpauseMinting();
        console.log("Minting Unpaused, id: "+tx.hash);
        await tx.wait();
        alert('Action Successful!');
      } catch (error) {
        console.log('Error: ', error);
        
      }
    }
  }
  const mintingPaused = async () => {
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
  const capF = async () => {
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
  const remainingMintableSupply = async () => {
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

  //burn buttons
  const burn = async () =>{
    const amt = document.getElementById("burn-amount-inputs").value.trim();
    if(contractCheck()){
      try {
        if(amt === '' || isNaN(amt) || parseFloat(amt) <= 0) {
          alert('Please enter a valid amount to burn.');
          return;
        }
        const tx = await contract.burn(amt);
        console.log("Burned tokens, id: "+tx.hash);
        await tx.wait();
        alert('Action Successful!');
      } catch (err) {
        console.log('Action failed: ',err);
      }
    }
  }

  const burnFrom = async () => {
    const addr = document.getElementById("burn-address-inputs").value.trim();
    const amt = document.getElementById("burn-from-amount-inputs").value.trim();
    if(contractCheck()){
      try {
        if(!ethers.utils.isAddress(addr)) {
          alert('Invalid address.');
          return;
        }
        if(amt === '' || isNaN(amt) || parseFloat(amt) <= 0) {
          alert('Please enter a valid amount to burn.');
          return;
        }
        const tx = await contract.burnFrom(addr, amt);
        console.log("Burned tokens from "+addr+", id: "+tx.hash);
        await tx.wait();
        alert('Action Successful!');
      } catch (err) {
        console.log('Action failed: ',err);
      }
    }
  }

  //emergency buttons

  const emergencyPause = async () => {
    if(contractCheck){
      try {
        const tx = await contract.emergencyPause();
        console.log("Contract Paused, id: "+tx.hash);
        await tx.wait();
        alert('Action Successful!');
      } catch (err) {
        console.log('Action failed: ',err);
      }
    }
  }

  const unpause = async () => {
    if(contractCheck){
      try {
        const tx = await contract.unpause();
        console.log("Contract unpaused, id: "+tx.hash);
        await tx.wait();
        alert('Action Successful!');
      } catch (err) {
        console.log('Action failed: ',err);
      }
    }
  }

  const contractPaused = async () => {
    if(contractCheck){
      try {
        const tx = await contract.contractPaused();
        console.log("Contract Paused Status: ",tx);
        await tx.wait();
        alert('Contract Pause Status: ' + tx);
      } catch (err) {
        console.log('Action failed: ',err);
      }
    }
  }

  // destruction buttons

  async function proposeDestruction() {
    if(contractCheck){
      try {
        const tx = await contract.proposeDestruction();
        console.log('Contract Destruction proposed, id: ', tx.hash);
        await tx.wait();
        alert('Action successful!');
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }
  async function cancelDestruction() {
    if(contractCheck){
      try {
        const tx = await contract.cancelDestruction();
        console.log('Contract Destruction cancelled, id: ', tx.hash);
        await tx.wait();
        alert('Action successful!');
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }

  // trying to disable the destroy button if input not available
  const [inputValue, setInputValue] = useState('');
  async function executeDestruction() {
    if(!(inputValue.trim() === '')){
      
      const opin = document.querySelector("destroy-inputs").value.trim();

      if(contractCheck){
        try {
          const tx = await contract.executeDestruction(opin);
          console.log('Contract Destroyed, id: ', tx.hash);
          await tx.wait();
          alert('Action successful!');
        } catch (err) {
          console.log('Action failed: ', err);
        }
      }
      
    }
  }

  const isDisbaled = inputValue.trim() === '';

  const isDestroyed = async () => {
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
  
  //recovery functions

  const recoverERC20 = async() =>{
    const [addr, amt] = document.querySelectorAll(".recovery-inp").value.trim();
    if(contractCheck()) {
      try {
        if(!ethers.utils.isAddress(addr)){
          alert('Invalid Address');
          return;
        }
        const tx = await contract.recoverERC20(addr, amt);
        console.log('Recovered tokens, id: ', tx.hash);
        await tx.wait();
        alert('Transaction successful: '+ tx.hash);
      } catch (err) {
        console.log('Action failed: ', err);
      }
    }
  }

  const recoverETH = async () => {
    if(contractCheck()) {
      try {
        const tx=await contract.recoverETH();
        console.log('Recovered ETH, id: ', tx.hash);
        await tx.wait();
        alert('Transaction successful: ' + tx.hash);
      } catch (err) {
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
                <div className="transfer-erc">
                  <button id="transfer" onClick={transfer} className="erc-buttons">
                    Transfer
                  </button>
                  <input
                    type="text"
                    placeholder="User Address"
                    id="erc-transfer-inputs"
                    className="inputs"
                  /><input
                  type="number"
                  placeholder="Amount"
                  id="erc-amount1-inputs"
                  className="inputs"
                                />
                </div>
                <div className="transferFrom-erc">
                  <button id="transferFrom" onClick={transferFrom} className="erc-buttons">
                    Transfer from
                  </button>
                  {/* <label htmlFor="transferfrom-from-inputs">From:repeat this  </label> */}
                  <input
                    type="text"
                    placeholder="From: User Address"
                    id="transferfrom-from-inputs"
                    className="inputs"
                  />
                  <input
                  type="text"
                  placeholder="To: User Address"
                  id="transferfrom-to-inputs"
                  className="inputs"
                  />
                  <input
                  type="number"
                  placeholder="Amount"
                  id="erc-amount2-inputs"
                  className="inputs"
                  />
                </div>
                <div className="approve-erc">
                  <button id="approve" onClick={approve} className="erc-buttons">
                    Approve
                  </button>
                  <input
                    type="text"
                    placeholder="Spender: User Address"
                    id="approve-spender-inputs"
                    className="inputs"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    id="approve-amount-inputs"
                    className="inputs"
                  />
                </div>
                <div className="allowance-erc">
                  <button id="allowance" onClick={allowance} className="erc-buttons">
                    Allowance
                  </button>
                  <input
                    type="text"
                    placeholder="Owner: User Address"
                    id="allowance-owner-inputs"
                    className="inputs"
                  />
                  <input
                    type="text"
                    placeholder="Spender: User Address"
                    id="allowance-spender-inputs"
                    className="inputs"
                  />
                </div>
                <button id="balanceOf" onClick={balanceOf} className="erc-buttons">
                  Balance of
                </button>
                <input
                  type="text"
                  placeholder="User Address"
                  id="balanceof-account-inputs"
                  className="inputs"
                />
                <button id="totalSupply" onClick={totalSupply} className="erc-buttons">
                  Total supply?
                </button>
                <button id="decimals" onClick={decimals} className="erc-buttons">
                  Decimals
                </button>
                <button id="name" onClick={name} className="erc-buttons">
                  Contract Name
                </button>
                <button id="symbol" onClick={symbol} className="erc-buttons">
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
                <div className="owner-transfer">
                  <button id="transferOwnership"onClick={transferOwnership} className="admin-buttons">
                    Transfer Owner
                  </button>
                  <input
                  type="text"
                  placeholder=" Give User Address"
                  id="admin-inputs"
                  className="inputs"
                />
                </div>
                <button id="renounceOwnership" onClick={renounceOwnership} className="admin-buttons">
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
                <div className="mintbox">
                  <button id="mint" onClick={mint} className="mint-buttons">
                    Mint
                  </button>
                  <input
                    type="text"
                    placeholder=" Give User Address"
                    id="mint-address-inputs"
                    className="inputs"
                  />
                  <input
                  type="number"
                  placeholder=" amount"
                  id="mint amount-inputs"
                  className="inputs"
                />
                </div>
                <button id="pauseMinting" onClick={pauseMinting} className="mint-buttons">
                  Pause minting
                </button>
                <button id="unpauseMinting" onClick={unpauseMinting} className="mint-buttons">
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
                <div className="burn-mine">
                  <button id="burn" onClick={burn} className="burn-buttons">
                    Burn mine
                  </button>
                  <input
                    type="number"
                    placeholder="Amount"
                    id="burn-amount-inputs"
                    className="inputs"
                  />
                </div>
                <div className="burn-from">
                  <button id="burnFrom" onClick={burnFrom} className="burn-buttons">
                    Burn from
                  </button>
                  <input
                    type="text"
                    placeholder="User Address"
                    id="burn-address-inputs"
                    className="inputs"
                  />
                  <input
                  type="number"
                  placeholder="Amount"
                  id="burn-from-amount-inputs"
                  className="inputs"
                  />
                </div>
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
                <button id="emergencyPause" onClick={emergencyPause} className="emergency-buttons">
                  Wait, Pause!
                </button>
                <button id="unpause" onClick={unpause} className="emergency-buttons">
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
                <button id="proposeDestruction" onClick={proposeDestruction} className="destruction-buttons">
                  Propose Destruction
                </button>
                <button id="cancelDestruction" onClick={cancelDestruction} className="destruction-buttons">
                  Cancel Destruction
                </button>
                <div className="destroy-now">
                  <button id="executeDestruction" className="destruction-buttons" onClick={executeDestruction} disabled={isDisbaled}>
                    Destroy Now!
                  </button>
                  <input
                    type="number"
                    placeholder="0 for No otherwise Yes."
                    id="destroy-inputs"
                    className="inputs"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
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
                <div className="recovery-inputs">
                  <button id="recoverERC20" onClick={recoverERC20} className="recovery-buttons">
                    Recover my tokens.
                  </button>
                  <input
                      type="text"
                      placeholder="token address"
                      id="recover-token-address-inputs"
                      className="inputs recovery-inp"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      id="recovery-amount-inputs"
                      className="inputs recovery-inp"
                    />
                </div>
                <button id="recoverETH" onClick={recoverETH} className="recovery-buttons">
                  Recover my ETH.
                </button>
              </div>
            </div>
            {/* <div className="test-block">
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
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
