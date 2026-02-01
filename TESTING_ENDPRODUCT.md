Based on the codebase and UI, here are the complete steps to perform a full demo of the Decentralized Identity with Zero-Knowledge Access Control project:

## 🎯 Complete Demo Steps

### **Phase 1: Setup & Wallet Connection**

1. **Open the Application**
   ```bash
   $BROWSER http://localhost:3000
   ```

2. **Connect MetaMask Wallet**
   - Click "Connect Wallet" button in the top-right corner
   - Select MetaMask and approve the connection
   - Ensure you're connected to Localhost 31337 (Hardhat Network)
   - Use one of the Hardhat test accounts (e.g., `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`)

---

### **Phase 2: Create Decentralized Identity (DID)**

3. **Navigate to "My DID" Page**
   - Click "My DID" in the navigation menu

4. **Create Your DID**
   - Click "Create Your DID" button
   - The system will:
     - Generate a DID document
     - Store it on IPFS (mock mode)
     - Register it on the blockchain (DIDRegistry contract)
     - Save metadata to MongoDB
   - You should see your DID displayed with format: `did:ethr:0x{your-address}`

5. **View DID Details**
   - See your DID identifier
   - View public keys associated with your DID
   - Check the IPFS hash of your DID document
   - Verify on-chain registration status

---

### **Phase 3: Request and Receive Credentials**

6. **Navigate to "Credentials" Page**
   - Click "Credentials" in the navigation menu

7. **Request a Credential**
   - Click "Request Credential" button
   - Select credential type (e.g., "Age Verification", "Membership", etc.)
   - Fill in required information:
     - **For Age Credential**: Enter your date of birth
     - **For Membership**: Enter organization details
   - Submit the request

8. **Issuer Issues the Credential** (Backend Process)
   - The issuer (authorized address) reviews and approves
   - Credential is created with:
     - Credential subject (your data)
     - Issuer signature
     - Issuance date
   - Credential is stored on IPFS
   - Hash is registered on blockchain (CredentialRegistry contract)

9. **View Your Credentials**
   - See all credentials issued to your DID
   - Check verification status (green checkmark for verified)
   - View credential details (type, issuer, issuance date)

---

### **Phase 4: Generate Zero-Knowledge Proofs**

10. **Navigate to "ZK Proofs" Page**
    - Click "ZK Proofs" in the navigation menu

11. **Create Age Verification Proof**
    - Select "Age Verification" proof type
    - Click "Create Proof" on your age credential
    - Enter the minimum age requirement (e.g., 18)
    - The system will:
      - Use your birthdate from the credential (private)
      - Generate a ZK proof using the Circom circuit
      - Prove you're over 18 WITHOUT revealing your exact age
    - Get the proof data (proof hash, public signals)

12. **Create Credential Ownership Proof**
    - Select "Credential Ownership" proof type
    - Choose a credential you own
    - Generate proof that you own this credential WITHOUT revealing its contents
    - The proof includes:
      - Credential hash
      - Your signature
      - Merkle tree proof of ownership

13. **Create Membership Verification Proof**
    - Select "Membership Verification" proof type
    - Choose a membership credential
    - Generate proof of membership in a group
    - The proof verifies membership WITHOUT revealing which group

14. **View Proof Details**
    - See the generated proof data
    - Check verification status
    - Copy proof for sharing or verification

---

### **Phase 5: Access Control with ZK Proofs**

15. **Navigate to "Access Control" Page**
    - Click "Access Control" in the navigation menu

16. **Create a Protected Resource**
    - Click "Create Resource" button
    - Define resource details:
      - Resource name (e.g., "VIP Content", "Adult Section")
      - Required proof type (Age, Membership, or Credential Ownership)
      - Access requirements (e.g., minimum age 21)
    - Submit to create the resource

17. **Request Access Using ZK Proof**
    - Select a protected resource
    - Click "Request Access"
    - Select an appropriate ZK proof you generated earlier
    - Submit the proof for verification
    - The smart contract (ZKAccessControl) will:
      - Verify the ZK proof on-chain
      - Check if proof meets resource requirements
      - Grant or deny access WITHOUT seeing your private data

18. **View Access Status**
    - See granted access with green indicator
    - View access logs and history
    - Check expiration time (if applicable)

---

### **Phase 6: Verification & Blockchain Interaction**

19. **Verify Proofs On-Chain**
    - In the ZK Proofs page, click "Verify on Blockchain"
    - The system calls the Groth16Verifier contract
    - See real-time verification results
    - Check gas costs and transaction hashes

20. **View Blockchain Transactions**
    - Open MetaMask to see transaction history
    - Each action creates a blockchain transaction:
      - DID registration
      - Credential issuance
      - Proof verification
      - Access control decisions

21. **Check Smart Contract Events**
    ```bash
    # In terminal, you can query events
    npx hardhat console --network localhost
    ```
    ```javascript
    const registry = await ethers.getContractAt("DIDRegistry", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
    const filter = registry.filters.DIDRegistered();
    const events = await registry.queryFilter(filter);
    console.log(events);
    ```

---

### **Phase 7: Advanced Features Demo**

22. **Revoke a Credential**
    - In Credentials page, select a credential
    - Click "Revoke" (if you're the issuer)
    - Confirm revocation
    - The credential is marked as revoked on-chain
    - Existing proofs using this credential become invalid

23. **Update DID Document**
    - In My DID page, click "Update DID"
    - Add a new public key or service endpoint
    - Submit update to IPFS and blockchain

24. **Test Privacy Preservation**
    - Share a ZK proof with someone
    - They can verify you meet requirements
    - But they CANNOT see your actual data:
      - ✅ Proven: You're over 21
      - ❌ Hidden: Your exact birthdate
      - ✅ Proven: You have membership
      - ❌ Hidden: Which organization

---

## 🔍 **Key Demo Highlights to Emphasize**

### **Privacy Preservation**
- Your actual age is never revealed, only proof that age > threshold
- Credential contents remain private, only ownership is proven
- Group membership is verified without revealing the group

### **Decentralization**
- No central authority stores your identity
- You control your DID and credentials
- Blockchain ensures tamper-proof records

### **Zero-Knowledge Proofs**
- Mathematical proofs computed using Circom circuits
- Verified on-chain using Groth16 verifier
- No trusted third party needed

### **Smart Contract Integration**
- All verifications happen on Ethereum blockchain
- Transparent and auditable access control
- Immutable credential registry

---

## 📊 **Demo Flow Summary**

```
Connect Wallet → Create DID → Request Credential → Receive Credential
     ↓
Generate ZK Proof → Verify Proof → Request Access → Access Granted
     ↓
View Transaction History → Check On-Chain Data → Demo Complete!
```

This complete demo showcases the entire functionality of the decentralized identity system with zero-knowledge access control! 🎉