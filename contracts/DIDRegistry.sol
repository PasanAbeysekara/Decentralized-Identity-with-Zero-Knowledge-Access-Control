// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title DIDRegistry
 * @dev Registry for Decentralized Identifiers (DIDs) with document management
 */
contract DIDRegistry is Ownable {
    using ECDSA for bytes32;

    struct DIDDocument {
        address controller;
        string documentHash; // IPFS hash of the full DID document
        uint256 created;
        uint256 updated;
        bool active;
    }

    struct PublicKey {
        string id;
        string keyType;
        string publicKeyHex;
        uint256 created;
        bool revoked;
    }

    struct Service {
        string id;
        string serviceType;
        string serviceEndpoint;
    }

    // DID => DIDDocument
    mapping(string => DIDDocument) private didDocuments;
    
    // DID => PublicKey[]
    mapping(string => PublicKey[]) private publicKeys;
    
    // DID => Service[]
    mapping(string => Service[]) private services;
    
    // Address => DID (reverse lookup)
    mapping(address => string) private controllerToDID;

    event DIDCreated(string indexed did, address indexed controller, string documentHash);
    event DIDUpdated(string indexed did, string documentHash);
    event DIDDeactivated(string indexed did);
    event PublicKeyAdded(string indexed did, string keyId);
    event PublicKeyRevoked(string indexed did, string keyId);
    event ServiceAdded(string indexed did, string serviceId);
    event ServiceRemoved(string indexed did, string serviceId);
    event ControllerChanged(string indexed did, address indexed oldController, address indexed newController);

    constructor() Ownable(msg.sender) {}

    modifier onlyController(string memory did) {
        require(didDocuments[did].controller == msg.sender, "Not the DID controller");
        require(didDocuments[did].active, "DID is deactivated");
        _;
    }

    /**
     * @dev Create a new DID
     * @param did The DID identifier
     * @param documentHash IPFS hash of the DID document
     */
    function createDID(string memory did, string memory documentHash) external {
        require(bytes(did).length > 0, "DID cannot be empty");
        require(didDocuments[did].controller == address(0), "DID already exists");
        require(bytes(controllerToDID[msg.sender]).length == 0, "Controller already has a DID");

        didDocuments[did] = DIDDocument({
            controller: msg.sender,
            documentHash: documentHash,
            created: block.timestamp,
            updated: block.timestamp,
            active: true
        });

        controllerToDID[msg.sender] = did;

        emit DIDCreated(did, msg.sender, documentHash);
    }

    /**
     * @dev Update DID document
     * @param did The DID identifier
     * @param documentHash New IPFS hash of the DID document
     */
    function updateDID(string memory did, string memory documentHash) external onlyController(did) {
        didDocuments[did].documentHash = documentHash;
        didDocuments[did].updated = block.timestamp;

        emit DIDUpdated(did, documentHash);
    }

    /**
     * @dev Deactivate a DID
     * @param did The DID identifier
     */
    function deactivateDID(string memory did) external onlyController(did) {
        didDocuments[did].active = false;
        delete controllerToDID[msg.sender];

        emit DIDDeactivated(did);
    }

    /**
     * @dev Add a public key to DID
     * @param did The DID identifier
     * @param keyId Key identifier
     * @param keyType Type of the key (e.g., "EcdsaSecp256k1VerificationKey2019")
     * @param publicKeyHex Public key in hex format
     */
    function addPublicKey(
        string memory did,
        string memory keyId,
        string memory keyType,
        string memory publicKeyHex
    ) external onlyController(did) {
        publicKeys[did].push(PublicKey({
            id: keyId,
            keyType: keyType,
            publicKeyHex: publicKeyHex,
            created: block.timestamp,
            revoked: false
        }));

        emit PublicKeyAdded(did, keyId);
    }

    /**
     * @dev Revoke a public key
     * @param did The DID identifier
     * @param keyIndex Index of the key in the array
     */
    function revokePublicKey(string memory did, uint256 keyIndex) external onlyController(did) {
        require(keyIndex < publicKeys[did].length, "Invalid key index");
        require(!publicKeys[did][keyIndex].revoked, "Key already revoked");

        publicKeys[did][keyIndex].revoked = true;

        emit PublicKeyRevoked(did, publicKeys[did][keyIndex].id);
    }

    /**
     * @dev Add a service endpoint
     * @param did The DID identifier
     * @param serviceId Service identifier
     * @param serviceType Type of service
     * @param serviceEndpoint Service endpoint URL
     */
    function addService(
        string memory did,
        string memory serviceId,
        string memory serviceType,
        string memory serviceEndpoint
    ) external onlyController(did) {
        services[did].push(Service({
            id: serviceId,
            serviceType: serviceType,
            serviceEndpoint: serviceEndpoint
        }));

        emit ServiceAdded(did, serviceId);
    }

    /**
     * @dev Remove a service endpoint
     * @param did The DID identifier
     * @param serviceIndex Index of the service in the array
     */
    function removeService(string memory did, uint256 serviceIndex) external onlyController(did) {
        require(serviceIndex < services[did].length, "Invalid service index");

        string memory serviceId = services[did][serviceIndex].id;
        
        // Move the last element to the deleted spot and pop
        services[did][serviceIndex] = services[did][services[did].length - 1];
        services[did].pop();

        emit ServiceRemoved(did, serviceId);
    }

    /**
     * @dev Transfer DID control to a new address
     * @param did The DID identifier
     * @param newController New controller address
     */
    function transferControl(string memory did, address newController) external onlyController(did) {
        require(newController != address(0), "Invalid new controller");
        require(bytes(controllerToDID[newController]).length == 0, "New controller already has a DID");

        address oldController = didDocuments[did].controller;
        
        didDocuments[did].controller = newController;
        didDocuments[did].updated = block.timestamp;
        
        delete controllerToDID[oldController];
        controllerToDID[newController] = did;

        emit ControllerChanged(did, oldController, newController);
    }

    // View functions

    function getDID(string memory did) external view returns (
        address controller,
        string memory documentHash,
        uint256 created,
        uint256 updated,
        bool active
    ) {
        DIDDocument memory doc = didDocuments[did];
        return (doc.controller, doc.documentHash, doc.created, doc.updated, doc.active);
    }

    function getDIDByController(address controller) external view returns (string memory) {
        return controllerToDID[controller];
    }

    function getPublicKeys(string memory did) external view returns (PublicKey[] memory) {
        return publicKeys[did];
    }

    function getServices(string memory did) external view returns (Service[] memory) {
        return services[did];
    }

    function isActive(string memory did) external view returns (bool) {
        return didDocuments[did].active;
    }

    function verifyController(string memory did, address controller) external view returns (bool) {
        return didDocuments[did].controller == controller && didDocuments[did].active;
    }
}
