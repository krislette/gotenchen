const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying GotenChain...");

  const GotenChain = await hre.ethers.getContractFactory("GotenChain");
  const contract = await GotenChain.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`\n[SUCCESS] GotenChain deployed to: ${address}\n`);

  // Read the compiled ABI
  const artifact = await hre.artifacts.readArtifact("GotenChain");

  // Write address + ABI to the frontend so it can connect
  const config = { address, abi: artifact.abi };
  const outPath = path.join(
    __dirname,
    "../frontend/src/lib/contractConfig.json",
  );

  fs.writeFileSync(outPath, JSON.stringify(config, null, 2));
  console.log(
    `[FILE] Contract config written to: frontend/src/lib/contractConfig.json`,
  );
  console.log(`\nNow start the frontend:\n  cd frontend && npm run dev\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
