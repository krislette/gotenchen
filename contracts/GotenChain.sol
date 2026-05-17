// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title GotenChain - Decentralized Gairaigo Registry
/// @notice A community-governed, immutable registry of Japanese loanword etymologies
contract GotenChain {
    // ─── Enums & Structs ─────────────────────────────────────────────────────

    enum Status { Pending, Ratified, Rejected }

    struct Entry {
        uint256 id;
        string katakana;      // e.g. テレビ
        string romaji;        // e.g. terebi
        string donorLanguage; // e.g. English
        string sourceWord;    // e.g. television
        string meaning;       // e.g. television set
        string category;      // e.g. Technology
        address proposer;
        uint256 upvotes;
        uint256 downvotes;
        Status status;
        uint256 timestamp;
    }

    // ─── Constants ───────────────────────────────────────────────────────────

    /// Net upvotes needed for an entry to be ratified
    uint256 public constant RATIFY_THRESHOLD = 3;
    /// Net downvotes needed for an entry to be rejected
    uint256 public constant REJECT_THRESHOLD = 3;

    // ─── State ───────────────────────────────────────────────────────────────

    uint256 private _entryCount;

    mapping(uint256 => Entry) private _entries;
    /// hasVoted[entryId][voterAddress] = true if they already voted
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    /// On-chain contributor score: increments when a proposed entry gets ratified
    mapping(address => uint256) public contributorScore;

    // ─── Events ──────────────────────────────────────────────────────────────

    event EntryProposed(uint256 indexed id, string katakana, address indexed proposer);
    event Voted(uint256 indexed id, address indexed voter, bool upvote);
    event EntryRatified(uint256 indexed id, string katakana);
    event EntryRejected(uint256 indexed id, string katakana);

    // ─── Functions ───────────────────────────────────────────────────────────

    /// @notice Propose a new gairaigo entry for community review
    function proposeEntry(
        string calldata katakana,
        string calldata romaji,
        string calldata donorLanguage,
        string calldata sourceWord,
        string calldata meaning,
        string calldata category
    ) external returns (uint256) {
        require(bytes(katakana).length > 0, "Katakana required");
        require(bytes(donorLanguage).length > 0, "Donor language required");
        require(bytes(meaning).length > 0, "Meaning required");

        uint256 id = _entryCount;
        _entries[id] = Entry({
            id: id,
            katakana: katakana,
            romaji: romaji,
            donorLanguage: donorLanguage,
            sourceWord: sourceWord,
            meaning: meaning,
            category: category,
            proposer: msg.sender,
            upvotes: 0,
            downvotes: 0,
            status: Status.Pending,
            timestamp: block.timestamp
        });
        _entryCount++;

        emit EntryProposed(id, katakana, msg.sender);
        return id;
    }

    /// @notice Cast a vote on a pending entry
    /// @param id The entry ID to vote on
    /// @param upvote True to upvote, false to downvote
    function vote(uint256 id, bool upvote) external {
        require(id < _entryCount, "Entry does not exist");
        Entry storage entry = _entries[id];
        require(entry.status == Status.Pending, "Entry is not pending");
        require(!hasVoted[id][msg.sender], "Already voted on this entry");
        require(entry.proposer != msg.sender, "Cannot vote on your own entry");

        hasVoted[id][msg.sender] = true;

        if (upvote) {
            entry.upvotes++;
        } else {
            entry.downvotes++;
        }

        emit Voted(id, msg.sender, upvote);

        // Auto-ratify or reject based on net vote threshold
        int256 net = int256(entry.upvotes) - int256(entry.downvotes);
        if (net >= int256(RATIFY_THRESHOLD)) {
            entry.status = Status.Ratified;
            contributorScore[entry.proposer]++;
            emit EntryRatified(id, entry.katakana);
        } else if (-net >= int256(REJECT_THRESHOLD)) {
            entry.status = Status.Rejected;
            emit EntryRejected(id, entry.katakana);
        }
    }

    /// @notice Fetch a single entry by ID
    function getEntry(uint256 id) external view returns (Entry memory) {
        require(id < _entryCount, "Entry does not exist");
        return _entries[id];
    }

    /// @notice Total number of entries ever proposed
    function getTotalEntries() external view returns (uint256) {
        return _entryCount;
    }
}
