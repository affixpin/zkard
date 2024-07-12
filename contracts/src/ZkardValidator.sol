// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC7579ValidatorBase} from "modulekit/Modules.sol";
import {PackedUserOperation} from "modulekit/external/ERC4337.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "solady/utils/ECDSA.sol";

import {IVerifier} from "./interfaces/IVerifier.sol";

contract ZkardValidator is ERC7579ValidatorBase, Ownable {
    /*//////////////////////////////////////////////////////////////////////////
                            CONSTANTS & STORAGE
    //////////////////////////////////////////////////////////////////////////*/

    event ModuleInitialized(address indexed account);
    event ModuleUninitialized(address indexed account);
    event CollateralAdded(address indexed account, uint8 indexed collateralId);
    event CollateralRemoved(
        address indexed account,
        uint8 indexed collateralId
    );

    error InvalidCollateral();
    error CollateralAlreadyEnabled();
    error CollateralNotEnabled();
    error HasCollaterals();
    error ModuleIsInitialized();
    error ModuleIsNotInitialized();

    struct Account {
        bool initialized;
        uint8[] collateralIds;
    }
    struct PossitionProxy {
        uint8 proxyId;
        bool isEnabled;
    }

    IVerifier public verifier;

    mapping(address possitionProxyAddress => uint8 proxyId) public proxyIds;
    mapping(uint8 proxyId => PossitionProxy possitionProxy) public proxyInfo;
    mapping(address account => Account accountData) public accounts;

    /*//////////////////////////////////////////////////////////////////////////
                                     CONFIG
    //////////////////////////////////////////////////////////////////////////*/

    constructor(
        address bankAddress,
        address verifierAddress
    ) Ownable(bankAddress) {
        verifier = IVerifier(verifierAddress);
    }

    function onInstall(bytes calldata) external override {
        if (isInitialized(msg.sender)) revert ModuleIsInitialized();

        accounts[msg.sender].initialized = true;
        emit ModuleInitialized(msg.sender);
    }

    function onUninstall(bytes calldata data) external override {
        // validate the account is initialized
        if (!isInitialized(msg.sender)) revert ModuleIsNotInitialized();

        // verify the borrowed amount = 0

        // verify no supported proxies
        if (accounts[msg.sender].collateralIds.length > 0)
            revert HasCollaterals();
    }

    function isInitialized(address smartAccount) public view returns (bool) {
        return accounts[smartAccount].initialized;
    }

    function isCollateralEnabled(
        address account,
        uint8 collateralId
    ) public view returns (bool) {
        uint8[] memory collateralIds = accounts[account].collateralIds;
        for (uint256 i = 0; i < collateralIds.length; i++) {
            if (collateralIds[i] == collateralId) {
                return true;
            }
        }
        return false;
    }

    function isCollateralSupported(
        uint8 collateralId
    ) public view returns (bool) {
        return proxyInfo[collateralId].isEnabled;
    }

    function addCollateral(uint8 collateralId) external {
        address accountAddress = msg.sender;
        Account memory account = accounts[accountAddress];

        if (!account.initialized) revert NotInitialized(accountAddress);

        if (!isCollateralSupported(collateralId)) revert InvalidCollateral();

        if (isCollateralEnabled(accountAddress, collateralId))
            revert CollateralAlreadyEnabled();

        accounts[accountAddress].collateralIds.push(collateralId);
        emit CollateralAdded(accountAddress, collateralId);
    }

    function removeCollateral(uint8 collateralId) external {
        address accountAddress = msg.sender;
        Account memory account = accounts[accountAddress];

        if (!account.initialized) revert NotInitialized(accountAddress);

        if (!isCollateralEnabled(accountAddress, collateralId))
            revert CollateralNotEnabled();

        for (uint256 i = 0; i < account.collateralIds.length; i++) {
            if (account.collateralIds[i] == collateralId) {
                delete account.collateralIds[i];
                break;
            }
        }

        accounts[accountAddress] = account;
        emit CollateralRemoved(accountAddress, collateralId);
    }

    /*//////////////////////////////////////////////////////////////////////////
                                    ONLY OWNER
    //////////////////////////////////////////////////////////////////////////*/

    function addCollateralProxy(uint8 proxyId, address proxyAddress) external {
        proxyInfo[proxyId] = PossitionProxy(proxyId, true);
        proxyIds[proxyAddress] = proxyId;
    }

    function enableCollateralProxy(uint8 proxyId) external {
        proxyInfo[proxyId].isEnabled = true;
    }

    function disableCollateralProxy(uint8 proxyId) external {
        proxyInfo[proxyId].isEnabled = false;
    }

    function setVerifier(address _verifier) external onlyOwner {
        verifier = IVerifier(_verifier);
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     LIQUIDATION
    //////////////////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////////////////
                                     MODULE LOGIC
    //////////////////////////////////////////////////////////////////////////*/

    /**
     * Validates PackedUserOperation
     *
     * @param userOp UserOperation to be validated
     * @param userOpHash Hash of the UserOperation to be validated
     *
     * @return sigValidationResult the result of the signature validation, which can be:
     *  - 0 if the signature is valid
     *  - 1 if the signature is invalid
     *  - <20-byte> aggregatorOrSigFail, <6-byte> validUntil and <6-byte> validAfter (see ERC-4337
     * for more details)
     */
    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) external view override returns (ValidationData) {
        bool isValid = _validateSignature(userOp, userOpHash);

        if (isValid) {
            return VALIDATION_SUCCESS;
        }
        return VALIDATION_FAILED;
    }

    /**
     * Validates an ERC-1271 signature
     *
     *
     * @return sigValidationResult the result of the signature validation, which can be:
     *  - EIP1271_SUCCESS if the signature is valid
     *  - EIP1271_FAILED if the signature is invalid
     */
    function isValidSignatureWithSender(
        address,
        bytes32,
        bytes calldata
    ) external view virtual override returns (bytes4 sigValidationResult) {
        return EIP1271_FAILED;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     INTERNAL
    //////////////////////////////////////////////////////////////////////////*/
    function _validateSignature(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash
    ) internal view returns (bool) {
        bytes32 hash = ECDSA.toEthSignedMessageHash(userOpHash);
        if (userOp.sender != ECDSA.recover(hash, userOp.signature))
            return false;
        return true;
    }
    /*//////////////////////////////////////////////////////////////////////////
                                     METADATA
    //////////////////////////////////////////////////////////////////////////*/

    /**
     * The name of the module
     *
     * @return name The name of the module
     */
    function name() external pure returns (string memory) {
        return "ZkardValidator";
    }

    /**
     * The version of the module
     *
     * @return version The version of the module
     */
    function version() external pure returns (string memory) {
        return "0.0.1";
    }

    /**
     * Check if the module is of a certain type
     *
     * @param typeID The type ID to check
     *
     * @return true if the module is of the given type, false otherwise
     */
    function isModuleType(
        uint256 typeID
    ) external pure override returns (bool) {
        return typeID == TYPE_VALIDATOR;
    }
}
