<script lang="ts">
  import { proposeEntry, fetchAllEntries } from "../contract";
  import {
    signer,
    provider,
    isConnected,
    entries,
    txPending,
  } from "../stores/chainStore";

  const DONOR_LANGUAGES = [
    "English",
    "French",
    "German",
    "Portuguese",
    "Dutch",
    "Italian",
    "Spanish",
    "Russian",
    "Arabic",
    "Chinese",
    "Korean",
    "Sanskrit",
    "Greek",
    "Latin",
    "Norwegian",
    "Swedish",
    "Czech",
    "Polish",
    "Hungarian",
    "Turkish",
    "Malay",
    "Hindi",
    "Persian",
    "Other",
  ];

  const CATEGORIES = [
    "Technology",
    "Food & Drink",
    "Fashion",
    "Sports",
    "Music",
    "Medicine",
    "Everyday",
    "Other",
  ];

  let form = {
    katakana: "",
    romaji: "",
    donorLanguage: "",
    sourceWord: "",
    meaning: "",
    category: "",
  };

  let success = false;
  let error = "";

  $: isValid =
    form.katakana.trim() &&
    form.donorLanguage &&
    form.meaning.trim() &&
    form.category;

  async function handleSubmit() {
    if (!$signer || !$provider) return;
    txPending.set(true);
    success = false;
    error = "";

    try {
      await proposeEntry($signer, form);
      success = true;
      // Reset form
      form = {
        katakana: "",
        romaji: "",
        donorLanguage: "",
        sourceWord: "",
        meaning: "",
        category: "",
      };
      // Refresh entries
      entries.set(await fetchAllEntries($provider));
    } catch (e: any) {
      error = e?.reason ?? e?.message ?? "Transaction failed";
    } finally {
      txPending.set(false);
    }
  }
</script>

<section class="propose">
  <div class="propose-header">
    <h2 class="mincho">新規エントリー提案</h2>
    <p class="subtitle">Propose a new gairaigo entry for community review</p>
  </div>

  {#if !$isConnected}
    <div class="wallet-prompt card">
      <span class="prompt-icon">鍵</span>
      <p>Connect your wallet to propose entries.</p>
    </div>
  {:else}
    <form class="card proposal-form" on:submit|preventDefault={handleSubmit}>
      <div class="form-row">
        <div class="field">
          <label for="katakana"
            >外来語 · Gairaigo <span style="color: var(--color-vermillion-h)"
              >*</span
            ></label
          >
          <input
            id="katakana"
            type="text"
            placeholder="e.g. テレビ"
            bind:value={form.katakana}
            required
          />
        </div>
        <div class="field">
          <label for="romaji">ローマ字 · Romaji</label>
          <input
            id="romaji"
            type="text"
            placeholder="e.g. terebi"
            bind:value={form.romaji}
          />
        </div>
      </div>

      <div class="form-row">
        <div class="field">
          <label for="donorLang"
            >供給言語 · Donor Language <span
              style="color: var(--color-vermillion-h)">*</span
            ></label
          >
          <select id="donorLang" bind:value={form.donorLanguage} required>
            <option value="" disabled>Select language…</option>
            {#each DONOR_LANGUAGES as lang}
              <option value={lang}>{lang}</option>
            {/each}
          </select>
        </div>
        <div class="field">
          <label for="sourceWord"
            >語源 · Source Word <span style="color: var(--color-vermillion-h)"
              >*</span
            ></label
          >
          <input
            required
            id="sourceWord"
            type="text"
            placeholder="e.g. television"
            bind:value={form.sourceWord}
          />
        </div>
      </div>

      <div class="field">
        <label for="meaning"
          >意味 · Meaning <span style="color: var(--color-vermillion-h)">*</span
          ></label
        >
        <textarea
          id="meaning"
          placeholder="e.g. television set; device for receiving broadcast video"
          bind:value={form.meaning}
          rows="2"
          required
        />
      </div>

      <div class="field">
        <label for="category"
          >カテゴリー · Category <span style="color: var(--color-vermillion-h)"
            >*</span
          ></label
        >
        <select id="category" bind:value={form.category} required>
          <option value="" disabled>Select category…</option>
          {#each CATEGORIES as cat}
            <option value={cat}>{cat}</option>
          {/each}
        </select>
      </div>

      {#if success}
        <div class="alert alert-success">
          提案完了！ Entry submitted successfully. It is now open for voting.
        </div>
      {/if}
      {#if error}
        <div class="alert alert-error">{error}</div>
      {/if}

      <div class="form-actions">
        <p class="form-note">
          <span style="color: var(--color-vermillion-h)">*</span> Required. Your
          wallet address will be recorded on-chain as the proposer.
        </p>
        <button
          type="submit"
          class="btn-primary submit-btn"
          disabled={!isValid || $txPending}
        >
          {$txPending ? "処理中…" : "提案する · Propose"}
        </button>
      </div>
    </form>
  {/if}
</section>

<style>
  .propose {
    padding: 1.5rem 0;
  }

  .propose-header {
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .propose-header h2 {
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

  .proposal-form {
    display: flex;
    flex-direction: column;
    gap: 0;
    max-width: 660px;
    margin: 0 auto;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 1rem;
  }
  @media (max-width: 520px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }

  .alert {
    padding: 0.65rem 1rem;
    border-radius: var(--radius);
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }
  .alert-success {
    background: #e6f4ee;
    color: var(--color-ratified);
    border: 1px solid #b2dfcc;
  }
  .alert-error {
    background: #fdeaea;
    color: var(--color-rejected);
    border: 1px solid #f5b8b8;
  }

  .form-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    padding-top: 0.5rem;
  }
  .form-note {
    font-size: 0.75rem;
    color: var(--color-ink-muted);
    flex: 1;
  }
  .submit-btn {
    padding: 0.6rem 1.6rem;
    font-size: 0.95rem;
  }
</style>
