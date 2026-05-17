const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const TouristDigitalID = await hre.ethers.getContractFactory("TouristDigitalID");
  const contract = await TouristDigitalID.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("TouristDigitalID deployed to:", address);

  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "TouristDigitalID.sol",
    "TouristDigitalID.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const output = {
    address,
    abi: artifact.abi,
  };

  const frontendPath = path.join(
    __dirname,
    "..",
    "..",
    "frontend",
    "src",
    "blockchain",
    "TouristDigitalID.json"
  );
  fs.mkdirSync(path.dirname(frontendPath), { recursive: true });
  fs.writeFileSync(frontendPath, JSON.stringify(output, null, 2));
  console.log("ABI and address saved to frontend/src/blockchain/TouristDigitalID.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
