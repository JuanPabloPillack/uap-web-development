// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FaucetToken
 * @dev An ERC20 token with a faucet functionality that allows users to claim tokens once per address
 */
contract FaucetToken is ERC20, Ownable {
    // Mapping to track which addresses have already claimed tokens
    mapping(address => bool) public hasClaimed;

    // Array to track all addresses that interacted with the faucet
    address[] private faucetUsers;

    // Amount of tokens to distribute (1 million tokens with 18 decimals)
    uint256 public constant FAUCET_AMOUNT = 1_000_000 * 10 ** 18;

    event TokensClaimed(address indexed recipient, uint256 amount);

    /**
     * @dev Constructor that initializes the token with name and symbol
     * @param name The name of the token
     * @param symbol The symbol of the token
     */
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {
        // No initial mint - tokens are minted when users claim from faucet
    }

    /**
     * @dev Allows a user to claim tokens from the faucet once per address
     * Mints new tokens and transfers them to the caller
     * Can only be called by addresses that haven't claimed before
     */
    function claimTokens() public {
        require(
            !hasClaimed[msg.sender],
            "FaucetToken: Address has already claimed tokens"
        );

        // Mark address as having claimed
        hasClaimed[msg.sender] = true;

        // Add user to faucet users array
        faucetUsers.push(msg.sender);

        // Mint new tokens directly to the caller
        _mint(msg.sender, FAUCET_AMOUNT);

        emit TokensClaimed(msg.sender, FAUCET_AMOUNT);
    }

    /**
     * @dev Allows the owner to mint new tokens to any address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Allows the owner to reset the claiming status for an address
     * @param account The address to reset
     */
    function resetClaimStatus(address account) public onlyOwner {
        hasClaimed[account] = false;
    }

    /**
     * @dev Check if an address has already claimed tokens
     * @param account The address to check
     * @return bool True if the address has claimed, false otherwise
     */
    function hasAddressClaimed(address account) public view returns (bool) {
        return hasClaimed[account];
    }

    /**
     * @dev Get the faucet amount
     * @return uint256 The amount of tokens distributed per claim
     */
    function getFaucetAmount() public pure returns (uint256) {
        return FAUCET_AMOUNT;
    }

    /**
     * @dev Get all addresses that have interacted with the faucet
     * @return address[] Array of all faucet user addresses
     */
    function getFaucetUsers() public view returns (address[] memory) {
        return faucetUsers;
    }
}
