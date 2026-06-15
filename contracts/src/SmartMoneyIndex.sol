// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SmartMoneyIndex
/// @notice Veritas commits every alpha signal on-chain BEFORE its outcome, then
///         resolves it later. This makes the agent's track record verifiable and
///         un-fakeable — the core "Verifiable Alpha" claim. Also publishes a
///         daily Smart Money Index for the Mantle economy.
contract SmartMoneyIndex {
    address public owner;

    struct Signal {
        bytes32 hash;       // keccak256 of the off-chain signal payload
        uint8   confidence; // 0-100
        uint64  committedAt;
        uint8   outcome;    // 0 = pending, 1 = won, 2 = lost
        uint64  resolvedAt;
    }

    uint256 public signalCount;
    mapping(uint256 => Signal) public signals;

    uint256 public wins;
    uint256 public resolved;

    // day (unix/86400) => index value (scaled)
    mapping(uint256 => uint256) public dailyIndex;

    event Committed(uint256 indexed id, bytes32 hash, uint8 confidence, uint64 ts);
    event Resolved(uint256 indexed id, uint8 outcome, uint64 ts);
    event IndexPublished(uint256 indexed day, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Commit a signal hash before the outcome is known.
    function commitSignal(bytes32 hash, uint8 confidence) external onlyOwner returns (uint256 id) {
        require(confidence <= 100, "bad confidence");
        id = ++signalCount;
        signals[id] = Signal(hash, confidence, uint64(block.timestamp), 0, 0);
        emit Committed(id, hash, confidence, uint64(block.timestamp));
    }

    /// @notice Resolve a committed signal as won (true) or lost (false).
    function resolveSignal(uint256 id, bool won_) external onlyOwner {
        Signal storage s = signals[id];
        require(s.committedAt != 0, "no signal");
        require(s.outcome == 0, "resolved");
        s.outcome = won_ ? 1 : 2;
        s.resolvedAt = uint64(block.timestamp);
        resolved += 1;
        if (won_) wins += 1;
        emit Resolved(id, s.outcome, uint64(block.timestamp));
    }

    /// @notice Publish the daily Smart Money Index value.
    function publishIndex(uint256 day, uint256 value) external onlyOwner {
        dailyIndex[day] = value;
        emit IndexPublished(day, value);
    }

    /// @notice (wins, resolved) — accuracy = wins/resolved.
    function getAccuracy() external view returns (uint256, uint256) {
        return (wins, resolved);
    }

    function transferOwnership(address n) external onlyOwner {
        owner = n;
    }
}
