const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('DIDRegistry', function () {
  let didRegistry;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const DIDRegistry = await ethers.getContractFactory('DIDRegistry');
    didRegistry = await DIDRegistry.deploy();
    await didRegistry.waitForDeployment();
  });

  describe('DID Creation', function () {
    it('Should create a new DID', async function () {
      const did = `did:ethr:${user1.address}`;
      const documentHash = 'QmTest123...';

      await expect(didRegistry.connect(user1).createDID(did, documentHash))
        .to.emit(didRegistry, 'DIDCreated')
        .withArgs(did, user1.address, documentHash);

      const didInfo = await didRegistry.getDID(did);
      expect(didInfo.controller).to.equal(user1.address);
      expect(didInfo.active).to.be.true;
    });

    it('Should not allow duplicate DIDs', async function () {
      const did = `did:ethr:${user1.address}`;
      const documentHash = 'QmTest123...';

      await didRegistry.connect(user1).createDID(did, documentHash);
      
      await expect(
        didRegistry.connect(user1).createDID(did, documentHash)
      ).to.be.revertedWith('DID already exists');
    });

    it('Should not allow empty DID', async function () {
      await expect(
        didRegistry.connect(user1).createDID('', 'QmTest123...')
      ).to.be.revertedWith('DID cannot be empty');
    });
  });

  describe('DID Updates', function () {
    it('Should update DID document', async function () {
      const did = `did:ethr:${user1.address}`;
      await didRegistry.connect(user1).createDID(did, 'QmOld...');

      const newHash = 'QmNew...';
      await expect(didRegistry.connect(user1).updateDID(did, newHash))
        .to.emit(didRegistry, 'DIDUpdated')
        .withArgs(did, newHash);

      const didInfo = await didRegistry.getDID(did);
      expect(didInfo.documentHash).to.equal(newHash);
    });

    it('Should only allow controller to update', async function () {
      const did = `did:ethr:${user1.address}`;
      await didRegistry.connect(user1).createDID(did, 'QmTest...');

      await expect(
        didRegistry.connect(user2).updateDID(did, 'QmNew...')
      ).to.be.revertedWith('Not the DID controller');
    });
  });

  describe('DID Deactivation', function () {
    it('Should deactivate DID', async function () {
      const did = `did:ethr:${user1.address}`;
      await didRegistry.connect(user1).createDID(did, 'QmTest...');

      await expect(didRegistry.connect(user1).deactivateDID(did))
        .to.emit(didRegistry, 'DIDDeactivated')
        .withArgs(did);

      const didInfo = await didRegistry.getDID(did);
      expect(didInfo.active).to.be.false;
    });
  });

  describe('Public Key Management', function () {
    it('Should add public key', async function () {
      const did = `did:ethr:${user1.address}`;
      await didRegistry.connect(user1).createDID(did, 'QmTest...');

      await didRegistry.connect(user1).addPublicKey(
        did,
        'key-1',
        'EcdsaSecp256k1',
        '0x1234...'
      );

      const keys = await didRegistry.getPublicKeys(did);
      expect(keys.length).to.equal(1);
      expect(keys[0].id).to.equal('key-1');
    });

    it('Should revoke public key', async function () {
      const did = `did:ethr:${user1.address}`;
      await didRegistry.connect(user1).createDID(did, 'QmTest...');
      await didRegistry.connect(user1).addPublicKey(did, 'key-1', 'EcdsaSecp256k1', '0x1234...');

      await didRegistry.connect(user1).revokePublicKey(did, 0);

      const keys = await didRegistry.getPublicKeys(did);
      expect(keys[0].revoked).to.be.true;
    });
  });
});
