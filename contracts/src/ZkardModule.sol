// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC7579HookDestruct} from "modulekit/Modules.sol";
import {PackedUserOperation} from "modulekit/external/ERC4337.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "solady/utils/ECDSA.sol";
import {IPossitionProxy} from "./interfaces/IPossitionProxy.sol";
import {IVerifier} from "./interfaces/IVerifier.sol";
import {Proof} from "./ProofTypes.sol";
import {IERC7579Account, Execution} from "modulekit/external/ERC7579.sol";
import {ERC7579ValidatorBase} from "modulekit/Modules.sol";

contract ZkardModule is ERC7579HookDestruct, Ownable, ERC7579ValidatorBase {
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
    error ValidationNeeded();
    error OnlyLiquidation();
    error LimitNotReached();
    error LiquidationAllowedByBankOnly();

    struct Account {
        bool isHookInstalled;
        bool isValidatorInstalled;
        uint8[] collateralIds;
    }

    struct PossitionProxy {
        address proxyAddress;
        uint8 proxyId;
        bool isEnabled;
    }

    IVerifier public verifier;

    mapping(address possitionProxyAddress => uint8 proxyId) public proxyIds;
    mapping(uint8 proxyId => PossitionProxy possitionProxy) public proxyInfo;
    mapping(address account => Account accountData) public accounts;

    uint256 public constant VALIDATOR_TYPE = 1;
    uint256 public constant HOOK_TYPE = 4;

    /*//////////////////////////////////////////////////////////////////////////
                                     CONFIG
    //////////////////////////////////////////////////////////////////////////*/

    constructor(
        address bankAddress,
        address verifierAddress
    ) Ownable(bankAddress) {
        verifier = IVerifier(verifierAddress);
    }

    /**
     * Initialize the module with the given data
     */
    function onInstall(bytes calldata callData) external override {
        uint256 moduleType = abi.decode(callData, (uint256));
        if (isInitialized(msg.sender)) revert ModuleIsInitialized();
        if (moduleType == HOOK_TYPE) {
            accounts[msg.sender].isHookInstalled = true;
        } else if (moduleType == VALIDATOR_TYPE) {
            accounts[msg.sender].isValidatorInstalled = true;
        }
        emit ModuleInitialized(msg.sender);
    }

    /**
     * De-initialize the module with the given data
     */
    function onUninstall(bytes calldata callData) external override {
        uint256 moduleType = abi.decode(callData, (uint256));

        // verify no supported proxies
        if (accounts[msg.sender].collateralIds.length > 0)
            revert HasCollaterals();
        delete accounts[msg.sender];

        if (moduleType == HOOK_TYPE) {
            accounts[msg.sender].isHookInstalled = false;
        } else if (moduleType == VALIDATOR_TYPE) {
            accounts[msg.sender].isValidatorInstalled = false;
        }

        emit ModuleUninitialized(msg.sender);
    }

    /**
     * Check if the module is initialized
     * @param smartAccount The smart account to check
     *
     * @return true if the module is initialized, false otherwise
     */
    function isInitialized(address smartAccount) public view returns (bool) {
        return
            accounts[smartAccount].isHookInstalled &&
            accounts[smartAccount].isValidatorInstalled;
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

        if (!isInitialized(accountAddress)) revert ModuleIsNotInitialized();

        if (!isCollateralSupported(collateralId)) revert InvalidCollateral();

        if (isCollateralEnabled(accountAddress, collateralId))
            revert CollateralAlreadyEnabled();

        accounts[accountAddress].collateralIds.push(collateralId);
        emit CollateralAdded(accountAddress, collateralId);
    }

    function removeCollateral(uint8 collateralId) external {
        address accountAddress = msg.sender;
        Account memory account = accounts[accountAddress];

        if (!isInitialized(accountAddress)) revert ModuleIsNotInitialized();

        if (!isCollateralEnabled(accountAddress, collateralId))
            revert CollateralNotEnabled();

        // TODO: check if collateral is not needed

        for (uint256 i = 0; i < account.collateralIds.length; i++) {
            if (account.collateralIds[i] == collateralId) {
                delete account.collateralIds[i];
                accounts[accountAddress].collateralIds[i] = account
                    .collateralIds[account.collateralIds.length - 1];
                accounts[accountAddress].collateralIds.pop();
                break;
            }
        }

        accounts[accountAddress] = account;
        emit CollateralRemoved(accountAddress, collateralId);
    }

    /*//////////////////////////////////////////////////////////////////////////
                                    ONLY OWNER
    //////////////////////////////////////////////////////////////////////////*/

    function enableCollateralProxy(uint8 proxyId) external onlyOwner {
        proxyInfo[proxyId].isEnabled = true;
    }

    function disableCollateralProxy(uint8 proxyId) external onlyOwner {
        proxyInfo[proxyId].isEnabled = false;
    }

    function setVerifier(address _verifier) external onlyOwner {
        verifier = IVerifier(_verifier);
    }

    function addCollateralProxy(
        uint8 proxyId,
        address proxyAddress
    ) external onlyOwner {
        proxyInfo[proxyId] = PossitionProxy(proxyAddress, proxyId, true);
        proxyIds[proxyAddress] = proxyId;
    }

    /*//////////////////////////////////////////////////////////////////////////
                                     LIQUIDATE
    //////////////////////////////////////////////////////////////////////////*/
    function liquidate(
        Proof memory proof,
        uint8 collateralId,
        bytes memory data
    ) internal {
        // if (isBank) {
        //     (
        //         IVerifier.Proof memory proof,
        //         uint8 collateralId,
        //         bytes memory data
        //     ) = abi.decode(callData, (IVerifier.Proof, uint8, bytes));
        //     collateralInAction = collateralId;
        //     callData = data;
        // }
        // for (uint8 i = 0; i < collateralIds.length; i++) {
        //     uint8 collateralId = collateralIds[i];
        //     if (!isCollateralSupported(collateralId)) continue;
        //     IPossitionProxy positionProxy = IPossitionProxy(
        //         proxyInfo[collateralId].proxyAddress
        //     );
        //     if (isBank) {
        //         limit += positionProxy.getBorrowLimit(accountAddress);
        //     }
        //     if (!isBank && positionProxy.isValidationNeeded(target, callData)) {
        //         collateralInAction = collateralId;
        //         break;
        //     }
        // }
        // if (!isBank && collateralInAction != 0) revert ValidationNeeded();
        // if (isBank) {
        //     if (collateralInAction == 0) revert OnlyLiquidation();
        //     if (!verifier.limitReached(proof, limit)) revert LimitNotReached();
        // }
    }

    // function isLiquidate(
    //     address target,
    //     bytes calldata callData
    // ) public view returns (bool) {
    //     if (target != address(this)) return false;
    //     if (callData.length >= 4) {
    //         if (bytes4(callData[:4]) == ZkardModule.liquidate.selector) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    /*//////////////////////////////////////////////////////////////////////////
                                     MODULE LOGIC
    //////////////////////////////////////////////////////////////////////////*/

    function _checkExecutionAllowed(
        address account,
        address msgSender,
        address target,
        bytes calldata callData
    ) internal view {
        address accountAddress = msg.sender;
        uint8[] memory collateralIds = accounts[accountAddress].collateralIds;

        if (msgSender == owner()) {
            return;
        }

        for (uint8 i = 0; i < collateralIds.length; i++) {
            uint8 collateralId = collateralIds[i];
            if (!isCollateralSupported(collateralId)) continue;

            IPossitionProxy positionProxy = IPossitionProxy(
                proxyInfo[collateralId].proxyAddress
            );

            if (positionProxy.isValidationNeeded(account, target, callData)) {
                revert ValidationNeeded();
            }
        }
    }

    function onExecute(
        address account,
        address msgSender,
        address target,
        uint256 value,
        bytes calldata callData
    ) internal virtual override returns (bytes memory hookData) {
        _checkExecutionAllowed(account, msgSender, target, callData);
    }

    function onExecuteBatch(
        address account,
        address msgSender,
        Execution[] calldata executions
    ) internal virtual override returns (bytes memory hookData) {
        for (uint256 i = 0; i < executions.length; i++) {
            _checkExecutionAllowed(
                account,
                msgSender,
                executions[i].target,
                executions[i].callData
            );
        }
    }

    function onExecuteFromExecutor(
        address account,
        address msgSender,
        address target,
        uint256 value,
        bytes calldata callData
    ) internal virtual override returns (bytes memory hookData) {
        _checkExecutionAllowed(account, msgSender, target, callData);
    }

    function onExecuteBatchFromExecutor(
        address account,
        address msgSender,
        Execution[] calldata executions
    ) internal virtual override returns (bytes memory hookData) {
        for (uint256 i = 0; i < executions.length; i++) {
            _checkExecutionAllowed(
                account,
                msgSender,
                executions[i].target,
                executions[i].callData
            );
        }
    }

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
        // validate is bank
        bool isValidSignature = _validateSignature(
            userOpHash,
            userOp.signature,
            owner()
        );

        bool liquidationCouldBeNeeded = accounts[msg.sender]
            .collateralIds
            .length > 0;

        if (isValidSignature && liquidationCouldBeNeeded) {
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
        bytes32 userOpHash,
        bytes memory signature,
        address sender
    ) internal view returns (bool) {
        bytes32 hash = ECDSA.toEthSignedMessageHash(userOpHash);
        if (sender != ECDSA.recover(hash, signature)) return false;
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
        return "ZkardModule";
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
        return typeID == TYPE_HOOK || typeID == TYPE_VALIDATOR;
    }
}
