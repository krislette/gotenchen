const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GotenChain", function () {
  let contract;
  let owner, voter1, voter2, voter3, voter4;

  // Sample entry data
  const sampleEntry = {
    katakana: "テレビ",
    romaji: "terebi",
    donorLanguage: "English",
    sourceWord: "television",
    meaning: "Television set",
    category: "Technology",
  };

  beforeEach(async () => {
    [owner, voter1, voter2, voter3, voter4] = await ethers.getSigners();
    const GotenChain = await ethers.getContractFactory("GotenChain");
    contract = await GotenChain.deploy();
  });

  // Proposal

  describe("Proposing entries", () => {
    it("should allow anyone to propose an entry", async () => {
      await contract
        .connect(owner)
        .proposeEntry(
          sampleEntry.katakana,
          sampleEntry.romaji,
          sampleEntry.donorLanguage,
          sampleEntry.sourceWord,
          sampleEntry.meaning,
          sampleEntry.category,
        );
      expect(await contract.getTotalEntries()).to.equal(1);
    });

    it("should store entry fields correctly", async () => {
      await contract
        .connect(owner)
        .proposeEntry(
          sampleEntry.katakana,
          sampleEntry.romaji,
          sampleEntry.donorLanguage,
          sampleEntry.sourceWord,
          sampleEntry.meaning,
          sampleEntry.category,
        );
      const entry = await contract.getEntry(0);
      expect(entry.katakana).to.equal(sampleEntry.katakana);
      expect(entry.donorLanguage).to.equal(sampleEntry.donorLanguage);
      expect(entry.proposer).to.equal(owner.address);
      expect(entry.status).to.equal(0); // Pending
    });

    it("should reject empty katakana", async () => {
      await expect(
        contract.proposeEntry(
          "",
          sampleEntry.romaji,
          sampleEntry.donorLanguage,
          sampleEntry.sourceWord,
          sampleEntry.meaning,
          sampleEntry.category,
        ),
      ).to.be.revertedWith("Katakana required");
    });
  });

  // Voting

  describe("Voting", () => {
    beforeEach(async () => {
      await contract
        .connect(owner)
        .proposeEntry(
          sampleEntry.katakana,
          sampleEntry.romaji,
          sampleEntry.donorLanguage,
          sampleEntry.sourceWord,
          sampleEntry.meaning,
          sampleEntry.category,
        );
    });

    it("should ratify an entry when net upvotes reach threshold", async () => {
      await contract.connect(voter1).vote(0, true);
      await contract.connect(voter2).vote(0, true);
      await contract.connect(voter3).vote(0, true);
      const entry = await contract.getEntry(0);
      expect(entry.status).to.equal(1); // Ratified
    });

    it("should reject an entry when net downvotes reach threshold", async () => {
      await contract.connect(voter1).vote(0, false);
      await contract.connect(voter2).vote(0, false);
      await contract.connect(voter3).vote(0, false);
      const entry = await contract.getEntry(0);
      expect(entry.status).to.equal(2); // Rejected
    });

    it("should increment proposer score on ratification", async () => {
      await contract.connect(voter1).vote(0, true);
      await contract.connect(voter2).vote(0, true);
      await contract.connect(voter3).vote(0, true);
      expect(await contract.contributorScore(owner.address)).to.equal(1);
    });

    it("should not allow double voting", async () => {
      await contract.connect(voter1).vote(0, true);
      await expect(contract.connect(voter1).vote(0, true)).to.be.revertedWith(
        "Already voted on this entry",
      );
    });

    it("should not allow the proposer to vote on their own entry", async () => {
      await expect(contract.connect(owner).vote(0, true)).to.be.revertedWith(
        "Cannot vote on your own entry",
      );
    });

    it("should not allow voting on a non-existent entry", async () => {
      await expect(contract.connect(voter1).vote(999, true)).to.be.revertedWith(
        "Entry does not exist",
      );
    });

    it("should not allow voting on an already-ratified entry", async () => {
      await contract.connect(voter1).vote(0, true);
      await contract.connect(voter2).vote(0, true);
      await contract.connect(voter3).vote(0, true);
      // Entry is now Ratified; voter4 tries to vote
      await expect(contract.connect(voter4).vote(0, true)).to.be.revertedWith(
        "Entry is not pending",
      );
    });

    it("should stay pending when net votes are below threshold", async () => {
      await contract.connect(voter1).vote(0, true);
      await contract.connect(voter2).vote(0, false); // net = 0
      const entry = await contract.getEntry(0);
      expect(entry.status).to.equal(0); // still Pending
    });
  });

  // Multiple entries

  describe("Multiple entries", () => {
    it("should handle multiple proposals independently", async () => {
      await contract
        .connect(owner)
        .proposeEntry(
          "パン",
          "pan",
          "Portuguese",
          "pão",
          "Bread",
          "Food & Drink",
        );
      await contract
        .connect(voter1)
        .proposeEntry(
          "テレビ",
          "terebi",
          "English",
          "television",
          "TV",
          "Technology",
        );
      expect(await contract.getTotalEntries()).to.equal(2);

      // Ratify first entry only
      await contract.connect(voter1).vote(0, true);
      await contract.connect(voter2).vote(0, true);
      await contract.connect(voter3).vote(0, true);

      expect((await contract.getEntry(0)).status).to.equal(1); // Ratified
      expect((await contract.getEntry(1)).status).to.equal(0); // Still pending
    });
  });
});
