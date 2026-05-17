<script lang="ts">
  import {
    entries,
    loading,
    isConnected,
    account,
    provider,
    signer,
    txPending,
  } from "../stores/chainStore";
  import { castVote, checkHasVoted, fetchAllEntries } from "../contract";
  import { showToast } from "../stores/toast";

  // Track which entries the current user has voted on
  let votedSet = new Set<number>();
  let loadingVotes = false;

  $: pending = $entries.filter((e) => e.status === 0);

  // Reload voted-set when account or entries change
  $: if ($account && $provider && pending.length > 0) {
    loadVotedSet();
  }

  async function loadVotedSet() {
    if (!$provider || !$account) return;
    loadingVotes = true;
    const checks = await Promise.all(
      pending.map((e) => checkHasVoted($provider!, e.id, $account)),
    );
    votedSet = new Set(pending.filter((_, i) => checks[i]).map((e) => e.id));
    loadingVotes = false;
  }

  async function handleVote(entryId: number, upvote: boolean) {
    if (!$signer || !$provider) return;
    txPending.set(true);

    try {
      await castVote($signer, entryId, upvote);
      showToast(`投票完了！ Vote recorded for entry #${entryId}.`, "success");
      entries.set(await fetchAllEntries($provider));
      await loadVotedSet();
    } catch (e: any) {
      showToast(e?.reason ?? e?.message ?? "Transaction failed", "error");
    } finally {
      txPending.set(false);
    }
  }

  function netVotes(e: { upvotes: number; downvotes: number }) {
    return e.upvotes - e.downvotes;
  }

  function truncate(addr: string) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  // RATIFY_THRESHOLD constant matches the contract
  const RATIFY_THRESHOLD = 3;
  const REJECT_THRESHOLD = 3;

  function progressPct(e: { upvotes: number; downvotes: number }) {
    const net = netVotes(e);
    // Map [-3, +3] → [0%, 100%] for the progress bar
    return Math.round(
      ((net + REJECT_THRESHOLD) / (RATIFY_THRESHOLD + REJECT_THRESHOLD)) * 100,
    );
  }
</script>

<section class="vote-tab">
  <div class="vote-header">
    <h2 class="mincho">審議中のエントリー</h2>
    <p class="subtitle">
      Vote to ratify or reject pending entries. One vote per wallet per entry.
    </p>
  </div>

  {#if !$isConnected}
    <div class="wallet-prompt card">
      <span class="prompt-icon">票</span>
      <p>Connect your wallet to participate in voting.</p>
    </div>
  {:else if $loading || loadingVotes}
    <div class="center-msg">
      <div class="spinner" />
      <p>Loading pending entries…</p>
    </div>
  {:else if pending.length === 0}
    <div class="center-msg">
      <p class="mincho empty-kanji">無</p>
      <p>No entries pending review right now.</p>
    </div>
  {:else}
    <div class="vote-list">
      {#each pending as entry (entry.id)}
        {@const alreadyVoted = votedSet.has(entry.id)}
        {@const ownEntry =
          entry.proposer.toLowerCase() === $account.toLowerCase()}
        {@const pct = progressPct(entry)}

        <article class="card vote-card">
          <div class="vote-card-top">
            <div class="vote-word">
              <span class="katakana mincho">{entry.katakana}</span>
              <span class="romaji">{entry.romaji}</span>
            </div>
            <span class="badge badge-pending">審議中 · Pending</span>
          </div>

          <p class="meaning">{entry.meaning}</p>

          <div class="entry-meta">
            <span class="donor"
              >{entry.donorLanguage}{entry.sourceWord
                ? ` · ${entry.sourceWord}`
                : ""}</span
            >
            <span class="category-text">{entry.category}</span>
          </div>

          <!-- Consensus progress bar -->
          <div class="progress-wrap">
            <span class="progress-label reject-label"
              >否決<br />Reject ▼{entry.downvotes}</span
            >
            <div class="progress-track">
              <div class="progress-fill" style="width: {pct}%" />
              <div class="progress-center" />
            </div>
            <span class="progress-label ratify-label"
              >▲{entry.upvotes} 承認<br /><span class="prog-sub">Ratify</span
              ></span
            >
          </div>

          <div class="vote-card-footer">
            <span class="proposer-label">
              Proposed by <span class="monospace"
                >{truncate(entry.proposer)}</span
              >
            </span>

            {#if ownEntry}
              <p class="own-entry-note">自分のエントリー · Your own entry</p>
            {:else if alreadyVoted}
              <p class="voted-note">Voted</p>
            {:else}
              <div class="vote-btns">
                <button
                  class="vote-btn upvote"
                  on:click={() => handleVote(entry.id, true)}
                  disabled={$txPending}
                  title="Upvote — support ratification"
                >
                  ▲ 承認 · Ratify
                </button>
                <button
                  class="vote-btn downvote"
                  on:click={() => handleVote(entry.id, false)}
                  disabled={$txPending}
                  title="Downvote — reject entry"
                >
                  ▼ 否決 · Reject
                </button>
              </div>
            {/if}
          </div>
        </article>
      {/each}
    </div>
  {/if}
</section>

<style>
  .vote-tab {
    padding: 1.5rem 0;
  }
  .vote-header {
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .vote-header h2 {
    font-size: 1.5rem;
    font-weight: 800;
  }
  .subtitle {
    color: var(--color-ink-muted);
    font-size: 0.875rem;
    margin-top: 0.2rem;
  }

  .wallet-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    padding: 3rem;
    text-align: center;
    color: var(--color-ink-muted);
  }
  .prompt-icon {
    font-size: 2rem;
  }

  .center-msg {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--color-ink-muted);
  }
  .empty-kanji {
    font-size: 3rem;
    color: var(--color-washi-dark);
    margin-bottom: 0.5rem;
  }
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-washi-dark);
    border-top-color: var(--color-vermillion);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin: 0 auto 0.75rem;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .vote-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 720px;
    margin: 0 auto;
  }

  .vote-card {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .vote-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .vote-word {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
  }
  .katakana {
    font-size: 1.5rem;
    font-weight: 800;
  }
  .romaji {
    font-size: 0.85rem;
    color: var(--color-ink-muted);
    font-style: italic;
  }
  .meaning {
    color: var(--color-ink-light);
    font-size: 0.95rem;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .entry-meta {
    display: flex;
    gap: 0.75rem;
    font-size: 0.8rem;
    color: var(--color-ink-muted);
  }

  .category-text {
    font-weight: 600;
  }

  /* Progress bar */
  .progress-wrap {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.35rem 0;
  }
  .progress-label {
    font-size: 0.72rem;
    font-weight: 700;
    white-space: nowrap;
    width: 64px;
  }
  .reject-label {
    color: var(--color-rejected);
    text-align: left;
  }
  .ratify-label {
    color: var(--color-ratified);
    text-align: right;
  }
  .progress-track {
    flex: 1;
    height: 8px;
    background: var(--color-washi-mid);
    border-radius: 999px;
    overflow: hidden;
    position: relative;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(
      to right,
      var(--color-rejected),
      var(--color-ratified)
    );
    border-radius: 999px;
    transition: width 0.3s ease;
    min-width: 4px;
  }
  .progress-center {
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 100%;
    background: var(--color-washi-dark);
    transform: translateX(-50%);
  }

  .vote-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 0.65rem;
    border-top: 1px solid var(--color-washi-mid);
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .proposer-label {
    font-size: 0.75rem;
    color: var(--color-ink-muted);
  }
  .monospace {
    font-family: monospace;
    font-size: 0.85em;
  }
  .own-entry-note,
  .voted-note {
    font-size: 0.8rem;
    color: var(--color-ink-muted);
    font-style: italic;
  }
  .voted-note {
    color: var(--color-ratified);
    font-style: normal;
    font-weight: 700;
  }

  .vote-btns {
    display: flex;
    gap: 0.5rem;
  }
  .vote-btn {
    padding: 0.4rem 0.9rem;
    border-radius: var(--radius);
    font-size: 0.85rem;
    font-weight: 700;
    font-family: var(--font-sans);
  }
  .upvote {
    background: #e6f4ee;
    color: var(--color-ratified);
    border: 1.5px solid var(--color-ratified);
  }
  .upvote:hover:not(:disabled) {
    background: #d0edde;
  }
  .downvote {
    background: #fdeaea;
    color: var(--color-rejected);
    border: 1.5px solid var(--color-rejected);
  }
  .downvote:hover:not(:disabled) {
    background: #facdcd;
  }
</style>
