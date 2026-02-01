const hre = require("hardhat");

async function main() {
  console.log("\n🔗 Connecting to deployed contracts...\n");

  // Get contract addresses
  const DID_REGISTRY = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const CREDENTIAL_REGISTRY = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const ZK_ACCESS_CONTROL = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  // Get signer
  const [signer] = await hre.ethers.getSigners();
  console.log("Using account:", signer.address);

  // Connect to DIDRegistry
  const DIDRegistry = await hre.ethers.getContractFactory("DIDRegistry");
  const didRegistry = DIDRegistry.attach(DID_REGISTRY);

  console.log("\n📝 Testing DIDRegistry...");
  
  // Register a DID
  const did = `did:example:${Date.now()}`;
  const document = "ipfs://QmTestDocument123";
  
  console.log(`Registering DID: ${did}`);
  const tx1 = await didRegistry.registerDID(did, document);
  await tx1.wait();
  console.log("✅ DID registered!");

  // Get DID document
  const retrievedDoc = await didRegistry.getDIDDocument(did);
  console.log(`Retrieved document: ${retrievedDoc}`);

  // Update DID
  const newDocument = "ipfs://QmUpdatedDocument456";
  console.log("\nUpdating DID document...");
  const tx2 = await didRegistry.updateDIDDocument(did, newDocument);
  await tx2.wait();
  console.log("✅ DID updated!");

  // Verify update
  const updatedDoc = await didRegistry.getDIDDocument(did);
  console.log(`Updated document: ${updatedDoc}`);

  // Connect to CredentialRegistry
  console.log("\n📜 Testing CredentialRegistry...");
  const CredentialRegistry = await hre.ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = CredentialRegistry.attach(CREDENTIAL_REGISTRY);

  // Issue a credential
  const credentialId = hre.ethers.id("credential-001");
  const credentialData = "ipfs://QmCredentialData789";
  
  console.log("Issuing credential...");
  const tx3 = await credentialRegistry.issueCredential(
    signer.address,
    credentialId,
    credentialData
  );
  await tx3.wait();
  console.log("✅ Credential issued!");

  // Verify credential
  const isValid = await credentialRegistry.verifyCredential(credentialId);
  console.log(`Credential valid: ${isValid}`);

  // Get credential
  const credential = await credentialRegistry.getCredential(credentialId);
  console.log("\nCredential details:");
  console.log(`  Issuer: ${credential.issuer}`);
  console.log(`  Subject: ${credential.subject}`);
  console.log(`  Data: ${credential.data}`);
  console.log(`  Issued at: ${new Date(Number(credential.issuedAt) * 1000).toISOString()}`);

  console.log("\n✅ All tests completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });