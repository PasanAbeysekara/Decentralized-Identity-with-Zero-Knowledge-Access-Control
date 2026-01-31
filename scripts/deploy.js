const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Starting deployment...\n');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', (await ethers.provider.getBalance(deployer.address)).toString(), '\n');

  // Deploy DIDRegistry
  console.log('📝 Deploying DIDRegistry...');
  const DIDRegistry = await ethers.getContractFactory('DIDRegistry');
  const didRegistry = await DIDRegistry.deploy();
  await didRegistry.waitForDeployment();
  const didRegistryAddress = await didRegistry.getAddress();
  console.log('✅ DIDRegistry deployed to:', didRegistryAddress, '\n');

  // Deploy CredentialRegistry
  console.log('📝 Deploying CredentialRegistry...');
  const CredentialRegistry = await ethers.getContractFactory('CredentialRegistry');
  const credentialRegistry = await CredentialRegistry.deploy(didRegistryAddress);
  await credentialRegistry.waitForDeployment();
  const credentialRegistryAddress = await credentialRegistry.getAddress();
  console.log('✅ CredentialRegistry deployed to:', credentialRegistryAddress, '\n');

  // Deploy ZKAccessControl
  console.log('📝 Deploying ZKAccessControl...');
  const ZKAccessControl = await ethers.getContractFactory('ZKAccessControl');
  const zkAccessControl = await ZKAccessControl.deploy();
  await zkAccessControl.waitForDeployment();
  const zkAccessControlAddress = await zkAccessControl.getAddress();
  console.log('✅ ZKAccessControl deployed to:', zkAccessControlAddress, '\n');

  // Register a sample credential schema
  console.log('📝 Registering sample credential schema...');
  const tx = await credentialRegistry.registerSchema(
    'AgeCredential',
    'https://example.com/schemas/age-credential.json'
  );
  await tx.wait();
  console.log('✅ Schema registered\n');

  // Summary
  console.log('=' .repeat(60));
  console.log('📦 DEPLOYMENT SUMMARY');
  console.log('=' .repeat(60));
  console.log('DIDRegistry:', didRegistryAddress);
  console.log('CredentialRegistry:', credentialRegistryAddress);
  console.log('ZKAccessControl:', zkAccessControlAddress);
  console.log('Deployer:', deployer.address);
  console.log('=' .repeat(60));

  // Save deployment addresses
  const fs = require('fs');
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    contracts: {
      DIDRegistry: didRegistryAddress,
      CredentialRegistry: credentialRegistryAddress,
      ZKAccessControl: zkAccessControlAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    './deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log('\n✅ Deployment info saved to deployment.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
