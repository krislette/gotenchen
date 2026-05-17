<a id="readme-top"></a>

<div align="center">
  <h1>語典チェーン · Goten Chain</h1>
  <p align="center">
    A decentralized, community-governed registry of Japanese loanword (外来語) etymologies on the Ethereum blockchain
    <br />
    <a href="#features">Features</a>
    ·
    <a href="#setup">Setup</a>
    ·
    <a href="#project-structure">Structure</a>
    ·
    <a href="#smart-contract">Smart Contract</a>
  </p>
</div>

## About The Project

語典チェーン (Goten Chain), meaning "word-lexicon chain," is a decentralized application (DApp) that implements a trustless, community-governed registry of Japanese loanwords (_gairaigo_, 外来語). Built with Solidity, Hardhat, ethers.js v6, and Svelte 4 + TypeScript, it deploys a smart contract to a local Ethereum node where any wallet holder can propose an etymology entry, vote on pending proposals, and earn an on-chain contributor score when their entries are ratified by community consensus.

Existing Japanese linguistic databases (JMdict, Daijisen) are centralized, maintained by small editorial teams with no transparent contribution history. Etymology disputes in gairaigo are real (e.g., パン: Portuguese _pão_ vs. Spanish _pan_). Goten Chain solves this with immutable, attributed records and trustless voting rather than editorial gatekeeping.

This project was built for COSC 402: Current Trends and Topics in Computing (Individual Smart Contract / DApp Implementation). It is the fourth (though, technically fifth if we included AC) in a series of Japanese-language NLP projects: Gairaigo statistical analysis -> Kataklassifer (LinearSVC donor-language classifier) -> 語旅 Kotabi (interactive gairaigo world map) -> 語典チェーン Goten Chain.

## Table of Contents

1. [About The Project](#about-the-project)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Setup](#setup)
5. [Project Structure](#project-structure)
6. [Smart Contract](#smart-contract)
7. [Website Snapshots](#website-snapshots)

## Features

- **On-Chain Proposals**: Any wallet holder can propose a gairaigo entry with katakana, romaji, donor language, source word, meaning, and semantic category, permanently stored on-chain with the proposer's address
- **Trustless Voting**: One vote per wallet per entry; proposers cannot vote on their own entries; all rules enforced at the contract level with no admin override
- **Auto-Ratification / Rejection**: Entries automatically move to Ratified (net votes ≥ +3) or Rejected (net votes ≤ −3) without any manual intervention
- **Contributor Score**: Proposer's on-chain reputation score increments each time one of their entries is ratified, visible in the stats bar
- **Browse Tab (閲覧)**: Searchable, filterable card grid of all ratified entries; click any card to open a full-detail modal; supports search by katakana, romaji, meaning, or source word
- **Propose Tab (提案)**: Wallet-gated form with 24 donor language options and 8 semantic categories; bilingual labels throughout
- **Vote Tab (投票)**: Pending entries with upvote/downvote controls, a consensus progress bar, and per-wallet voted tracking
- **Japanese Aesthetic**: Seigaiha wave header, washi paper tones, vermillion accents, Shippori Mincho B1 and Noto Sans JP typography, Japanese pigment palette for status and category chips
- **Toast Notifications**: Auto-dismissing success/error toasts replace inline DOM alerts
- **Responsive Cards**: Long meanings clamped to two lines with full text in modal; long continuous strings wrap correctly

## Technologies Used

| Technology                                   | Purpose                                               |
| -------------------------------------------- | ----------------------------------------------------- |
| [Solidity 0.8.20](https://soliditylang.org/) | Smart contract language                               |
| [Hardhat](https://hardhat.org/)              | Local Ethereum node, compilation, testing, deployment |
| [Chai](https://www.chaijs.com/)              | Smart contract unit assertions                        |
| [ethers.js v6](https://docs.ethers.org/v6/)  | Blockchain interaction from the frontend              |
| [Svelte 4](https://svelte.dev/) + TypeScript | Frontend framework and type safety                    |
| [Vite](https://vitejs.dev/)                  | Build tool and dev server                             |
| [MetaMask](https://metamask.io/)             | Browser wallet (EIP-1193 provider)                    |

## Setup

### Prerequisites

- Node.js 18+
- MetaMask browser extension

### Installation

```bash
git clone https://github.com/krislette/goten-chain.git
cd goten-chain
npm install
cd frontend && npm install && cd ..
```

### Run

```bash
# Terminal 1: Start local Ethereum node (keep running)
npm run node

# Terminal 2: Compile and deploy contract
npm run compile
npm run deploy

# Terminal 3: Start frontend
cd frontend && npm run dev
```

Frontend available at `http://localhost:5173`.

### MetaMask Configuration

1. Add network: RPC URL `http://127.0.0.1:8545`, Chain ID `31337`, Currency `ETH`
2. Import a test account: copy a private key from the `npm run node` output and import it into MetaMask (each account starts with 10,000 ETH)
3. Repeat for additional accounts to test voting with multiple wallets

> **Note**: Every time you restart `npm run node`, you must re-run `npm run deploy` — the chain resets and the old contract address becomes invalid.

### Run Tests

```bash
npm run test
```

## Project Structure

```
goten-chain/
├── contracts/
│ └── GotenChain.sol        # Smart contract: proposals, voting, ratification, scores
├── scripts/
│ └── deploy.js             # Deploys contract and writes contractConfig.json to frontend
├── test/
│ └── GotenChain.test.js    # 10 Hardhat/Chai unit tests
├── hardhat.config.js       # viaIR + optimizer (stack-depth fix)
├── package.json
└── frontend/
├── index.html
├── src/
│ ├── App.svelte            # Layout: header, stats strip, tab nav, footer
│ ├── app.css               # Design tokens, washi palette, seigaiha pattern
│ ├── main.ts
│ └── lib/
│ ├── contract.ts           # ethers v6 helpers: connectWallet, fetchAllEntries, proposeEntry, castVote
│ ├── contractConfig.json   # Auto-generated by deploy script
│ ├── stores/
│ │ ├── chainStore.ts       # Svelte stores: provider, signer, account, entries, loading
│ │ └── toast.ts            # Toast notification store and showToast helper
│ └── components/
│ ├── WalletConnect.svelte
│ ├── BrowseTab.svelte      # Ratified entries, search, filter, card modal
│ ├── ProposeTab.svelte     # Entry submission form
│ ├── VoteTab.svelte        # Pending entries, vote buttons, progress bar
│ └── Toaster.svelte        # Auto-dismissing toast overlay
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json
```

## Smart Contract

**GotenChain.sol** — deployed to `localhost:8545`, address written to `frontend/src/lib/contractConfig.json` by the deploy script.

| Function                                                                       | Description                                                                                        |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `proposeEntry(katakana, romaji, donorLanguage, sourceWord, meaning, category)` | Stores a new entry on-chain, emits `EntryProposed`                                                 |
| `vote(id, upvote)`                                                             | Casts a vote; enforces one-vote-per-wallet and no-self-vote; auto-ratifies or rejects at threshold |
| `getEntry(id)`                                                                 | Returns a single entry struct                                                                      |
| `getTotalEntries()`                                                            | Returns total entry count                                                                          |
| `contributorScore(address)`                                                    | Returns on-chain reputation score for a wallet                                                     |
| `hasVoted(entryId, address)`                                                   | Returns whether a wallet has voted on an entry                                                     |

**Constants**: `RATIFY_THRESHOLD = 3`, `REJECT_THRESHOLD = 3`

## Website Snapshots

### Browse Tab (閲覧)

### Propose Tab (提案)

### Vote Tab (投票)

<p align="right"><a href="#readme-top">Back to top</a></p>
