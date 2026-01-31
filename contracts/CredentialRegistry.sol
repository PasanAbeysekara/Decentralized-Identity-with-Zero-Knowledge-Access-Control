// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./DIDRegistry.sol";

/**
 * @title CredentialRegistry
 * @dev Registry for Verifiable Credentials with issuer management
 */
contract CredentialRegistry is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    DIDRegistry public didRegistry;

    struct Credential {
        bytes32 credentialHash; // Hash of the credential data
        string credentialType;
        address issuer;
        string issuerDID;
        string subjectDID;
        uint256 issuanceDate;
        uint256 expirationDate;
        bool revoked;
        string metadataURI; // IPFS hash or URL to credential metadata
    }

    struct CredentialSchema {
        string schemaType;
        string schemaURI;
        address creator;
        bool active;
    }

    // credentialId => Credential
    mapping(bytes32 => Credential) private credentials;
    
    // subjectDID => credentialId[]
    mapping(string => bytes32[]) private subjectCredentials;
    
    // issuerDID => credentialId[]
    mapping(string => bytes32[]) private issuedCredentials;
    
    // schemaType => CredentialSchema
    mapping(string => CredentialSchema) private schemas;
    
    // Revocation registry: credentialId => revocation timestamp
    mapping(bytes32 => uint256) private revocations;

    event CredentialIssued(
        bytes32 indexed credentialId,
        string indexed subjectDID,
        string indexed issuerDID,
        string credentialType
    );
    event CredentialRevoked(bytes32 indexed credentialId, uint256 revocationTime);
    event SchemaRegistered(string indexed schemaType, string schemaURI);
    event IssuerAdded(address indexed issuer, string did);
    event IssuerRemoved(address indexed issuer);

    constructor(address _didRegistry) {
        require(_didRegistry != address(0), "Invalid DID registry address");
        didRegistry = DIDRegistry(_didRegistry);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    modifier onlyActiveIssuer() {
        require(hasRole(ISSUER_ROLE, msg.sender), "Not an authorized issuer");
        string memory issuerDID = didRegistry.getDIDByController(msg.sender);
        require(bytes(issuerDID).length > 0, "Issuer must have a DID");
        require(didRegistry.isActive(issuerDID), "Issuer DID is not active");
        _;
    }

    /**
     * @dev Register a new credential schema
     * @param schemaType Type of the schema
     * @param schemaURI URI to the schema definition
     */
    function registerSchema(
        string memory schemaType,
        string memory schemaURI
    ) external onlyRole(ADMIN_ROLE) {
        require(bytes(schemaType).length > 0, "Schema type cannot be empty");
        require(!schemas[schemaType].active, "Schema already exists");

        schemas[schemaType] = CredentialSchema({
            schemaType: schemaType,
            schemaURI: schemaURI,
            creator: msg.sender,
            active: true
        });

        emit SchemaRegistered(schemaType, schemaURI);
    }

    /**
     * @dev Issue a new verifiable credential
     * @param credentialId Unique identifier for the credential
     * @param credentialHash Hash of the credential data
     * @param credentialType Type of credential
     * @param subjectDID DID of the credential subject
     * @param expirationDate Expiration timestamp (0 for no expiration)
     * @param metadataURI IPFS hash or URL to credential metadata
     */
    function issueCredential(
        bytes32 credentialId,
        bytes32 credentialHash,
        string memory credentialType,
        string memory subjectDID,
        uint256 expirationDate,
        string memory metadataURI
    ) external onlyActiveIssuer {
        require(credentials[credentialId].issuer == address(0), "Credential already exists");
        require(didRegistry.isActive(subjectDID), "Subject DID is not active");
        require(
            expirationDate == 0 || expirationDate > block.timestamp,
            "Invalid expiration date"
        );
        require(schemas[credentialType].active, "Invalid credential type");

        string memory issuerDID = didRegistry.getDIDByController(msg.sender);

        credentials[credentialId] = Credential({
            credentialHash: credentialHash,
            credentialType: credentialType,
            issuer: msg.sender,
            issuerDID: issuerDID,
            subjectDID: subjectDID,
            issuanceDate: block.timestamp,
            expirationDate: expirationDate,
            revoked: false,
            metadataURI: metadataURI
        });

        subjectCredentials[subjectDID].push(credentialId);
        issuedCredentials[issuerDID].push(credentialId);

        emit CredentialIssued(credentialId, subjectDID, issuerDID, credentialType);
    }

    /**
     * @dev Revoke a credential
     * @param credentialId ID of the credential to revoke
     */
    function revokeCredential(bytes32 credentialId) external {
        Credential storage credential = credentials[credentialId];
        require(credential.issuer != address(0), "Credential does not exist");
        require(credential.issuer == msg.sender, "Only issuer can revoke");
        require(!credential.revoked, "Credential already revoked");

        credential.revoked = true;
        revocations[credentialId] = block.timestamp;

        emit CredentialRevoked(credentialId, block.timestamp);
    }

    /**
     * @dev Add a new issuer
     * @param issuer Address of the issuer
     */
    function addIssuer(address issuer) external onlyRole(ADMIN_ROLE) {
        require(issuer != address(0), "Invalid issuer address");
        string memory issuerDID = didRegistry.getDIDByController(issuer);
        require(bytes(issuerDID).length > 0, "Issuer must have a DID");
        
        grantRole(ISSUER_ROLE, issuer);
        emit IssuerAdded(issuer, issuerDID);
    }

    /**
     * @dev Remove an issuer
     * @param issuer Address of the issuer
     */
    function removeIssuer(address issuer) external onlyRole(ADMIN_ROLE) {
        revokeRole(ISSUER_ROLE, issuer);
        emit IssuerRemoved(issuer);
    }

    // View functions

    function getCredential(bytes32 credentialId) external view returns (
        bytes32 credentialHash,
        string memory credentialType,
        address issuer,
        string memory issuerDID,
        string memory subjectDID,
        uint256 issuanceDate,
        uint256 expirationDate,
        bool revoked,
        string memory metadataURI
    ) {
        Credential memory cred = credentials[credentialId];
        return (
            cred.credentialHash,
            cred.credentialType,
            cred.issuer,
            cred.issuerDID,
            cred.subjectDID,
            cred.issuanceDate,
            cred.expirationDate,
            cred.revoked,
            cred.metadataURI
        );
    }

    function getSubjectCredentials(string memory subjectDID) external view returns (bytes32[] memory) {
        return subjectCredentials[subjectDID];
    }

    function getIssuedCredentials(string memory issuerDID) external view returns (bytes32[] memory) {
        return issuedCredentials[issuerDID];
    }

    function verifyCredential(bytes32 credentialId) external view returns (bool) {
        Credential memory cred = credentials[credentialId];
        
        if (cred.issuer == address(0)) return false;
        if (cred.revoked) return false;
        if (cred.expirationDate != 0 && cred.expirationDate < block.timestamp) return false;
        if (!didRegistry.isActive(cred.subjectDID)) return false;
        if (!didRegistry.isActive(cred.issuerDID)) return false;
        
        return true;
    }

    function isRevoked(bytes32 credentialId) external view returns (bool) {
        return credentials[credentialId].revoked;
    }

    function getRevocationTime(bytes32 credentialId) external view returns (uint256) {
        return revocations[credentialId];
    }

    function getSchema(string memory schemaType) external view returns (
        string memory schemaURI,
        address creator,
        bool active
    ) {
        CredentialSchema memory schema = schemas[schemaType];
        return (schema.schemaURI, schema.creator, schema.active);
    }
}
