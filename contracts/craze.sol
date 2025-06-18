//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/**
 * @title crazeToken
* @dev this is a advanced ERC20 token with capped, burnable and self-destruct features (reversible destruction)
 * @author shub.krishan208 
 * @notice the contract is inherited from the OpenZeppelin library
 * @notice for security purposes, it's using the ReentrancyGuard and Ownable inheritances
 * @notice the destroy feature uses the circuit-breaker pattern and implements the use of modifiers
 */

contract CrazeToken is ERC20Burnable, ERC20Capped, Ownable {
    //events
    event MintingPaused();
    event MintingUnpaused();

    //destruction tracking
    event DestructionProposed(uint256 proposedAt, uint256 executeAfter);
    event DestructionCancelled();
    event ContractPaused(uint256 pausedAt, uint256 remainingBalance);
    event ContractUnpaused(uint256 unpausedAt);
    event ETHRecovered(address , uint256 amount);
    event ContractDestroyed(uint256 destroyedAt, uint256 remainingBalance);

    //state variables
    bool public mintingPaused = false;
    bool public destructionProposed = false;
    bool public contractDestroyed = false; //for perma-destruction feature
    bool public contractPaused = false; //circuit breaker state
    uint256 public destructionProposedAt;
    uint256 public constant DESTRUCTION_DELAY = 1 days; //one day delay before destruction although the executeDestruction function will also have an immediate destruction option

    /**
     * @dev takes the initial values at the tiem of deployment
     * @param name Token Name "Craze Token"
     * @param symbol Token symbol "CRZ"
     * @param cap Maximum token supply
     * @param initialSupply Initial toen supply to the owner
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 cap,   
        uint initialSupply
    ) 
        ERC20(name, symbol) 
        ERC20Capped(cap) 
        Ownable(msg.sender) //initializes the sender as the owner
    {
        require(cap > 0, "Cap must be greater than 0!");
        require(initialSupply <= cap, "Initial Supply exceeds cap!!");
        
        if(initialSupply >0) {
            _mint(msg.sender, initialSupply);
        }
    }

    // modifiers for circuit breaker pattern
    modifier whenNotPaused()  {
        require(!contractPaused, "Contract is paused");
        require(!contractDestroyed, "Contract is permanently destroyed");
        _;
    }
    modifier whenPaused() {
        require(contractPaused, "Contract is not paused");
        _;
    }

    //all the functions that are to be used in the contract

    //writing the below simply merges the _update logic from both ERC20 and ERC20Capped
    //hence tha capped and _mint logic are simply handled from withing the two parent contracts.
    function _update(address from, address to, uint256 amount) internal virtual override(ERC20, ERC20Capped) {
        super._update(from, to, amount);
    }

    /**
     * @dev A function to mint manually (by owner) to any address) the logic and supply cap is checked from within the parent contracts
     * @param to address to mint tokens to
     * @param amount amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner whenNotPaused {
        require(!mintingPaused, "Minting is paused!");

        _mint(to, amount);
    }

    /**
     * @dev Pause Minting
     */
    function pauseMinting() external onlyOwner whenNotPaused {
        mintingPaused = true;
        emit MintingPaused();
    }

    /**
     * @dev Unpause Minting
     */
    function unpauseMinting() external onlyOwner whenNotPaused {
        mintingPaused = false;
        emit MintingUnpaused();
    }

    function remainingMintableSupply() external view returns (uint256) {
        return cap() - totalSupply();
    }

    function recoverERC20(address token, uint256 amount) external onlyOwner whenPaused {
        require(token != address(this), "Cannot recover own token");

        ERC20(token).transfer(owner(), amount);
    }

    /**
     * @dev emergency function to transfer all the ETH held by the contract to the owner.
     */
    function recoverETH() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
        emit ETHRecovered(owner(), address(this).balance);
    }

    //self destruct functions

    function proposeDestruction() external onlyOwner {
        require(!destructionProposed, "Destruction already proposed");

        destructionProposed = true;
        destructionProposedAt = block.timestamp;

        emit DestructionProposed(block.timestamp, destructionProposedAt + DESTRUCTION_DELAY);
        
        //Pausing the contract to prevent further interactions
        contractPaused = true;

        emit ContractPaused(block.timestamp, address(this).balance);
    }

    function cancelDestruction() external onlyOwner {
        require(destructionProposed, "No destruction proposal found!");
        require(destructionProposedAt + DESTRUCTION_DELAY > block.timestamp, "Destruction delay has passed!");

        destructionProposed = false;
        destructionProposedAt = 0;
        contractPaused = false;
        
        emit DestructionCancelled();
        emit ContractUnpaused(block.timestamp);
    }

    function executeDestruction(uint256 immediateDestruction) external onlyOwner whenPaused {
        require(destructionProposed, "Destruction not proposed");
        require(
            block.timestamp >= destructionProposedAt + DESTRUCTION_DELAY || immediateDestruction > 0, "Destruction delay not passed yet."
        );

        //Get remaining ETH balance before destruction
        uint256 remainingBalance = address(this).balance;

        //Transfer any remaining ETH to the owner
        if(remainingBalance > 0) {
            payable(owner()).transfer(remainingBalance);
            emit ETHRecovered(owner(), remainingBalance);
        }

        //Permanently pause the contract (irreversible)
        contractDestroyed = true;

        emit ContractDestroyed(block.timestamp, address(this).balance);
    }

    function emergencyPause() external onlyOwner whenNotPaused {
        contractPaused = true;
        emit ContractPaused(block.timestamp, address(this).balance);
    }

    function unpause() external onlyOwner whenPaused {
        require(!contractDestroyed, "Contract is permanently destroyed");

        contractPaused = false;
        emit ContractUnpaused(block.timestamp);
    }

    function isDestroyed() external view returns (bool) {
        return contractDestroyed;
    }

    //security error handlers

    //since the contract has no need to accept payments to itself, we can override teh receive() function to prevent accidental ETH transfers
    receive() external whenNotPaused payable {
        revert("Direct ETH transfers to the contract not allowed.");
    }

    //to manage non-existent function calls
    fallback() external whenNotPaused {
        revert("Function does not exist.");
    }

    /**
     * 
     * @return _name name of contract
     * @return _symbol symbol of contract
     * @return _decimals decimals defined within the contract, here by paraent contract ERC20.sol
     * @return _totalSupply total supply of tokens possible
     * @return _cap max supply of tokens possible
     * @return _mintableSupply remaining mintable supply of tokens
     * @notice _mintableSupply is calculated as cap - totalSupply
     * @return _mintingPaused shows the bool value of mintingPaused
     * @return _contractDestroyed shows the bool value of contractDestroyed
     */
    function getContractInfo() external view returns (
        string memory _name,
        string memory _symbol,
        uint256 _decimals,
        uint256 _totalSupply,
        uint256 _cap,
        uint256 _mintableSupply,
        bool _mintingPaused,
        bool _contractDestroyed
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            cap(),
            cap() - totalSupply(),
            mintingPaused,
            contractDestroyed
        );
    }

    /**
     * @dev Get user info function for balance and allowance
     * @param user address of user to get info of
     * @return _balance balance of the said user
     * @return _allowance allowance of teh user by the owner
     */
    function getUserInfo(address user) external view returns (
        uint256 _balance,
        uint256 _allowance
    ) {
        return (
            balanceOf(user),
            allowance(user, owner())
        );
    }
}