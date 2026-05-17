<script lang="ts">
  import { entries, loading } from "../stores/chainStore";
  import { isConnected } from "../stores/chainStore";
  import type { ChainEntry } from "../stores/chainStore";

  const CATEGORY_COLORS: Record<string, string> = {
    Technology: "var(--color-tech)",
    "Food & Drink": "var(--color-food)",
    Fashion: "var(--color-fashion)",
    Sports: "var(--color-sports)",
    Music: "var(--color-music)",
    Medicine: "var(--color-medicine)",
    Everyday: "var(--color-everyday)",
    Other: "var(--color-other)",
  };

  let search = "";
  let filterLang = "";
  let selected: ChainEntry | null = null;

  $: ratified = $entries.filter((e) => e.status === 1);

  $: donorLanguages = [...new Set(ratified.map((e) => e.donorLanguage))].sort();

  $: filtered = ratified.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.katakana.includes(q) ||
      e.romaji.toLowerCase().includes(q) ||
      e.meaning.toLowerCase().includes(q) ||
      e.sourceWord.toLowerCase().includes(q);
    const matchLang = !filterLang || e.donorLanguage === filterLang;
    return matchSearch && matchLang;
  });

  function formatDate(ts: number) {
    return new Date(ts * 1000).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function chipStyle(category: string) {
    const color = CATEGORY_COLORS[category] ?? "var(--color-other)";
    return `background:${color}18; color:${color}; border:1px solid ${color}44;`;
  }
</script>

<section class="browse">
  <!-- Filters -->
  <div class="filters">
    <input
      type="search"
      placeholder="Search katakana, meaning, romaji…"
      bind:value={search}
    />
    <select bind:value={filterLang}>
      <option value="">All donor languages</option>
      {#each donorLanguages as lang}
        <option value={lang}>{lang}</option>
      {/each}
    </select>
  </div>

  <!-- Stats bar -->
  {#if $isConnected}
    <div class="stats-bar">
      <span class="mincho stats-num">{filtered.length}</span>
      <span class="stats-label">
        {filtered.length === 1 ? "entry" : "entries"} ratified
      </span>
    </div>
  {/if}

  <!-- Loading -->
  {#if $loading}
    <div class="center-msg">
      <div class="spinner" />
      <p>Fetching chain data…</p>
    </div>

    <!-- Empty -->
  {:else if filtered.length === 0}
    <div class="center-msg">
      <p class="mincho empty-kanji">空</p>
      <p>
        No ratified entries yet.{search || filterLang
          ? " Try clearing filters."
          : " Be the first to propose one!"}
      </p>
    </div>

    <!-- Grid -->
  {:else}
    <div class="entry-grid">
      {#each filtered as entry (entry.id)}
        <article
          class="card entry-card"
          on:click={() => (selected = entry)}
          role="button"
          tabindex="0"
        >
          <div class="entry-top">
            <span class="badge badge-ratified">承認済 · Ratified</span>
          </div>
          <div class="entry-word">
            <span class="katakana mincho">{entry.katakana}</span>
            <span class="romaji" class:muted={!entry.romaji}>
              {entry.romaji || "no romaji"}
            </span>
          </div>
          <p class="meaning">{entry.meaning}</p>
          <div class="entry-meta">
            <span class="meta-chip" style={chipStyle(entry.category)}
              >{entry.category}</span
            >
            <span class="donor-tag">{entry.donorLanguage}</span>
            {#if entry.sourceWord}
              <span class="source-word"><em>{entry.sourceWord}</em></span>
            {/if}
          </div>
          <div class="entry-footer">
            <span class="vote-score"
              >▲ {entry.upvotes} · ▼ {entry.downvotes}</span
            >
            <span class="entry-date">{formatDate(entry.timestamp)}</span>
          </div>
        </article>
      {/each}
    </div>

    {#if selected}
      <div class="modal-backdrop" on:click={() => (selected = null)}>
        <div class="modal card" on:click|stopPropagation>
          <div class="modal-top">
            <span class="badge badge-ratified">承認済 · Ratified</span>
            <button class="modal-close" on:click={() => (selected = null)}
              >✕</button
            >
          </div>
          <span class="katakana mincho">{selected.katakana}</span>
          <span class="romaji">{selected.romaji || "no romaji"}</span>
          <p class="modal-meaning">{selected.meaning}</p>
          <div class="entry-meta" style="margin-top:0.5rem">
            <span class="meta-chip" style={chipStyle(selected.category)}
              >{selected.category}</span
            >
            <span class="donor-tag"
              >{selected.donorLanguage}{selected.sourceWord
                ? ` · ${selected.sourceWord}`
                : ""}</span
            >
          </div>
          <div class="modal-footer">
            <span class="vote-score"
              >▲ {selected.upvotes} · ▼ {selected.downvotes}</span
            >
            <span class="entry-date">{formatDate(selected.timestamp)}</span>
          </div>
          <div class="proposer">
            Proposed by <span class="monospace">{selected.proposer}</span>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</section>

<style>
  .browse {
    padding: 1.5rem 0;
  }

  .filters {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  .filters input {
    flex: 1;
    min-width: 180px;
  }
  .filters select {
    flex: 0 0 200px;
  }

  .stats-bar {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    margin-bottom: 1.25rem;
    padding-left: 0.1rem;
  }
  .stats-num {
    font-size: 1.8rem;
    color: var(--color-vermillion);
    font-weight: 800;
  }
  .stats-label {
    font-size: 0.85rem;
    color: var(--color-ink-muted);
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

  .entry-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1rem;
  }

  .entry-card {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .entry-top {
    margin-bottom: 0.3rem;
  }
  .entry-word {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
    flex-wrap: wrap;
  }
  .katakana {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--color-ink);
    letter-spacing: 0.04em;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .romaji {
    font-size: 0.85rem;
    color: var(--color-ink-muted);
    font-style: italic;
  }
  .muted {
    font-style: italic;
    opacity: 0.45;
  }
  .meaning {
    font-size: 0.95rem;
    color: var(--color-ink-light);
    margin-top: 0.1rem;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
  }

  .entry-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }
  .source-word {
    font-size: 0.8rem;
    color: var(--color-ink-muted);
  }

  .meta-chip {
    font-size: 0.72rem;
    font-weight: 700;
    border-radius: 999px;
    letter-spacing: 0.04em;
  }
  .donor-tag {
    font-size: 0.8rem;
    color: var(--color-ink-muted);
  }

  .entry-footer {
    display: flex;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 0.6rem;
    border-top: 1px solid var(--color-washi-mid);
    font-size: 0.75rem;
    color: var(--color-ink-muted);
  }
  .vote-score {
    font-weight: 700;
  }

  /* Modal */
  .entry-card {
    cursor: pointer;
  }
  .entry-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
    transition:
      box-shadow 0.15s,
      transform 0.15s;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 1rem;
  }
  .modal {
    max-width: 480px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    max-height: 90vh;
    overflow-y: auto;
  }
  .modal-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.25rem;
  }
  .modal-close {
    background: none;
    border: none;
    font-size: 1rem;
    color: var(--color-ink-muted);
    cursor: pointer;
    padding: 0.25rem;
  }
  .modal-meaning {
    color: var(--color-ink-light);
    font-size: 0.95rem;
    line-height: 1.6;
    word-break: break-word;
  }
  .modal-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 0.6rem;
    border-top: 1px solid var(--color-washi-mid);
    font-size: 0.75rem;
    color: var(--color-ink-muted);
  }
  .proposer {
    font-size: 0.72rem;
    color: var(--color-ink-muted);
    word-break: break-all;
  }
  .monospace {
    font-family: monospace;
  }
</style>
