// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// src/AgentIdentity.sol

/// @title AgentIdentity (ERC-8004 Identity, minimal)
/// @notice ERC-8004 mandates an on-chain identity for participating agents.
///         This is a compact, dependency-free ERC-721 Identity Registry: each
///         agent gets a portable identity NFT plus a registered domain/operator.
contract AgentIdentity {
    string public name = "Veritas Agent Identity";
    string public symbol = "VAI";

    uint256 public totalAgents;
    mapping(uint256 => address) public ownerOf;
    mapping(uint256 => string) public agentDomain;   // e.g. veritas.mantle
    mapping(uint256 => address) public agentAddress; // operator/agent EOA
    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event AgentRegistered(uint256 indexed id, address indexed operator, string domain);

    /// @notice Register an agent → mints an identity NFT to the operator.
    function register(string calldata domain, address agent) external returns (uint256 id) {
        id = ++totalAgents;
        ownerOf[id] = msg.sender;
        balanceOf[msg.sender] += 1;
        agentDomain[id] = domain;
        agentAddress[id] = agent;
        emit Transfer(address(0), msg.sender, id);
        emit AgentRegistered(id, agent, domain);
    }

    function tokenURI(uint256 id) external view returns (string memory) {
        require(ownerOf[id] != address(0), "no agent");
        return string.concat("veritas://agent/", agentDomain[id]);
    }

    function supportsInterface(bytes4 iid) external pure returns (bool) {
        return iid == 0x80ac58cd || iid == 0x01ffc9a7; // ERC721 + ERC165
    }
}
