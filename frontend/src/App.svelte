<script lang="ts">
  import { onMount } from "svelte";
  import {
    activeTab,
    provider,
    entries,
    loading,
    account,
    isConnected,
  } from "./lib/stores/chainStore";
  import {
    loadConfig,
    fetchAllEntries,
    getContributorScore,
  } from "./lib/contract";
  import WalletConnect from "./lib/components/WalletConnect.svelte";
  import BrowseTab from "./lib/components/BrowseTab.svelte";
  import ProposeTab from "./lib/components/ProposeTab.svelte";
  import VoteTab from "./lib/components/VoteTab.svelte";

  type TabId = "browse" | "propose" | "vote";

  const tabs: { id: TabId; label: string; ja: string }[] = [
    { id: "browse", label: "Browse", ja: "閲覧" },
    { id: "propose", label: "Propose", ja: "提案" },
    { id: "vote", label: "Vote", ja: "投票" },
  ];

  let configError = "";
  let score = 0;

  onMount(async () => {
    try {
      await loadConfig();
    } catch (e: any) {
      configError = e.message;
    }
  });

  // Refresh contributor score when account changes
  $: if ($account && $provider) {
    getContributorScore($provider, $account).then((s) => (score = s));
  }

  // Stats derived from entries
  $: ratifiedCount = $entries.filter((e) => e.status === 1).length;
  $: pendingCount = $entries.filter((e) => e.status === 0).length;
  $: languages = new Set(
    $entries.filter((e) => e.status === 1).map((e) => e.donorLanguage),
  ).size;
</script>

<!-- Header -->
<header class="site-header">
  <div class="header-inner">
    <div class="header-brand">
      <span class="header-kanji mincho">語典鎖</span>
      <div class="header-text">
        <span class="header-title mincho">語典チェーン</span>
        <span class="header-sub"
          >Goten Chain · Decentralized Gairaigo Registry</span
        >
      </div>
    </div>
    <WalletConnect />
  </div>
</header>

<!-- Config error -->
{#if configError}
  <div class="config-error">
    <strong>Contract not deployed.</strong>
    Run <code>npm run node</code> in one terminal, then
    <code>npm run deploy</code>
    in another.
    <br />{configError}
  </div>
{/if}

<!-- Stats bar -->
{#if $isConnected}
  <div class="stats-strip">
    <div class="stat-item">
      <span class="stat-val mincho">{ratifiedCount}</span>
      <span class="stat-lbl">Ratified</span>
    </div>
    <div class="stat-divider" />
    <div class="stat-item">
      <span class="stat-val mincho">{pendingCount}</span>
      <span class="stat-lbl">Pending</span>
    </div>
    <div class="stat-divider" />
    <div class="stat-item">
      <span class="stat-val mincho">{languages}</span>
      <span class="stat-lbl">Languages</span>
    </div>
    <div class="stat-divider" />
    <div class="stat-item">
      <span class="stat-val mincho">{score}</span>
      <span class="stat-lbl">Your Score</span>
    </div>
  </div>
{/if}

<!-- Tab nav -->
<nav class="tab-nav">
  <div class="tab-nav-inner">
    {#each tabs as tab}
      <button
        class="tab-btn"
        class:active={$activeTab === tab.id}
        on:click={() => activeTab.set(tab.id)}
      >
        <span class="tab-ja">{tab.ja}</span>
        <span class="tab-en">{tab.label}</span>
      </button>
    {/each}
  </div>
</nav>

<!-- Main content -->
<main class="main-content">
  {#if $activeTab === "browse"}
    <BrowseTab />
  {:else if $activeTab === "propose"}
    <ProposeTab />
  {:else}
    <VoteTab />
  {/if}
</main>

<!-- Footer -->
<footer class="site-footer">
  <div class="footer-inner">
    <span class="footer-kanji mincho">語典チェーン</span>
    <span class="footer-note"> Built for COSC 402</span>
  </div>
</footer>

<style>
  /* Header */
  .site-header {
    flex-shrink: 0;
    padding: 0 24px;
    padding: 1.1rem 1.5rem;
    background-color: var(--color-vermillion);
    border-bottom: 3px solid var(--color-accent);
    background-image: radial-gradient(
        circle at 100% 150%,
        #9e2a23 24%,
        #c23830 25%,
        #c23830 28%,
        #9e2a23 29%,
        #9e2a23 36%,
        #c23830 36%,
        #c23830 40%,
        transparent 40%,
        transparent
      ),
      radial-gradient(
        circle at 0% 150%,
        #9e2a23 24%,
        #c23830 25%,
        #c23830 28%,
        #9e2a23 29%,
        #9e2a23 36%,
        #c23830 36%,
        #c23830 40%,
        transparent 40%,
        transparent
      ),
      radial-gradient(
        circle at 50% 100%,
        #c23830 10%,
        #9e2a23 11%,
        #9e2a23 23%,
        #c23830 24%,
        #c23830 30%,
        #9e2a23 31%,
        #9e2a23 43%,
        #c23830 44%,
        #c23830 50%,
        #9e2a23 51%,
        #9e2a23 63%,
        #c23830 64%,
        #c23830 71%,
        transparent 71%,
        transparent
      ),
      radial-gradient(
        circle at 100% 50%,
        #c23830 5%,
        #9e2a23 6%,
        #9e2a23 15%,
        #c23830 16%,
        #c23830 20%,
        #9e2a23 21%,
        #9e2a23 29%,
        #c23830 30%,
        #c23830 34%,
        #9e2a23 35%,
        #9e2a23 44%,
        #c23830 44%,
        #c23830 49%,
        transparent 50%,
        transparent
      ),
      radial-gradient(
        circle at 0% 50%,
        #c23830 5%,
        #9e2a23 6%,
        #9e2a23 15%,
        #c23830 16%,
        #c23830 20%,
        #9e2a23 21%,
        #9e2a23 29%,
        #c23830 30%,
        #c23830 34%,
        #9e2a23 35%,
        #9e2a23 44%,
        #c23830 44%,
        #c23830 49%,
        transparent 50%,
        transparent
      );
    background-size: 80px 40px;
  }
  .header-inner {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  .header-brand {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .header-kanji {
    font-size: 2.4rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    letter-spacing: 0.05em;
  }
  .header-text {
    display: flex;
    flex-direction: column;
  }
  .header-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: 0.06em;
    line-height: 1.2;
  }
  .header-sub {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.75);
    letter-spacing: 0.04em;
  }

  /* Config error */
  .config-error {
    background: #fff3cd;
    border-bottom: 2px solid #e6ac00;
    color: #7a5500;
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    text-align: center;
  }
  .config-error code {
    background: rgba(0, 0, 0, 0.08);
    padding: 0.1em 0.35em;
    border-radius: 3px;
    font-size: 0.9em;
  }

  /* Stats strip */
  .stats-strip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    background: var(--color-ink);
    color: #fff;
    padding: 0.55rem 1.5rem;
    flex-wrap: wrap;
  }
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 1.5rem;
  }
  .stat-val {
    font-size: 1.35rem;
    font-weight: 800;
    color: #f5c06a;
  }
  .stat-lbl {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .stat-divider {
    width: 1px;
    height: 30px;
    background: rgba(255, 255, 255, 0.15);
  }

  /* Tab nav */
  .tab-nav {
    border-bottom: 2px solid var(--color-washi-dark);
    background: var(--color-washi-mid);
  }
  .tab-nav-inner {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    padding: 0 1.5rem;
  }
  .tab-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.65rem 1.4rem 0.55rem;
    background: transparent;
    border-bottom: 3px solid transparent;
    margin-bottom: -2px;
    cursor: pointer;
    transition:
      border-color 0.15s,
      color 0.15s;
    color: var(--color-ink-muted);
    gap: 0.05rem;
  }
  .tab-btn:hover {
    color: var(--color-ink);
  }
  .tab-btn.active {
    border-bottom-color: var(--color-vermillion);
    color: var(--color-vermillion);
  }
  .tab-ja {
    font-family: var(--font-mincho);
    font-size: 1rem;
    font-weight: 600;
  }
  .tab-en {
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* Main */
  .main-content {
    max-width: 960px;
    margin: 0 auto;
    padding: 0 1.5rem 3rem;
    flex: 1;
    width: 100%;
  }

  /* Footer */
  .site-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background-color: var(--color-vermillion);
    padding: 3px 24px;
    margin-top: auto;
    border-top: 3px solid var(--color-accent);
  }
  .footer-inner {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .footer-kanji {
    font-size: 1rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 0.04em;
  }
  .footer-note {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.85);
  }
</style>
