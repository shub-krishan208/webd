// scripts/deploy.js

/**
 * Main deployment function.
 * This function handles the process of deploying the Craze smart contract.
 */

// const hre = require("hardhat");
const fs = require("fs");

async function main() {
  // Get the first signer (account) from the Hardhat network.
  // This account will be used to deploy the contract.
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  /*
   * This is an abstraction used to deploy new smart contracts.
   *
   * Get the Contract in the 'Craze' variable from the .sol file
   */
  const Craze = await ethers.getContractFactory("CrazeToken");

  const constrParams = {
    CONTRACT_NAME: "Craze Token",
    CONTRACT_SYMBOL: "CRZ",
    CAP: "1000000001",
    INITIAL_SUPPLY: "1000010",
  };

  /*
   * deploy using the above inputs
   */
  const craze = await Craze.deploy(
    constrParams.CONTRACT_NAME,
    constrParams.CONTRACT_SYMBOL.toUpperCase(),
    constrParams.CAP,
    constrParams.INITIAL_SUPPLY
  );

  // Wait for the contract to be deployed and the transaction to be mined.
  await craze.deployed();

  console.log(
    "Craze contract deployed to address:",
    craze.address,
    "\n Deployed by user: ",
    deployer.address
  );

  /*
   * The deployments info might come useful in future, so storing them in a json
   * The following script does just that.
   */
  // Get the network name, hre is Hardhat Runtime Environment
  const network = hre.network.name;

  // path to store deployed info
  const deploymentsDir = `./deployments/${network}`;
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Get the contract artifact
  const CrazeArtifact = await hre.artifacts.readArtifact("CrazeToken");

  const deploymentInfo = {
    address: craze.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    abi: CrazeArtifact.abi,
  };

  const filePath = `${deploymentsDir}/Craze.json`;
  fs.writeFileSync(filePath, JSON.strgify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${filePath}`);
  // --- End: Save Deployment Information ---
}

/*
 *Execute main function with error handlers
 */

main()
  .then(() => process.exit(0)) // Exit with success code if deployment is successful
  .catch((error) => {
    console.error(error); // Log any errors that occurred during deployment
    process.exit(1); // Exit with an error code
  });
