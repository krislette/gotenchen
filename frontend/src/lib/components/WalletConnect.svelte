<script lang="ts">
  import { connectWallet } from "../contract";
  import { provider, signer, account, isConnected } from "../stores/chainStore";
  import { entries, loading } from "../stores/chainStore";
  import { fetchAllEntries } from "../contract";

  let connecting = false;
  let error = "";

  async function handleConnect() {
    connecting = true;
    error = "";
    try {
      const result = await connectWallet();
      provider.set(result.provider);
      signer.set(result.signer);
      account.set(result.account);
      loading.set(true);
      entries.set(await fetchAllEntries(result.provider));
      loading.set(false);
    } catch (e: any) {
      error = e.message ?? "Connection failed";
    } finally {
      connecting = false;
    }
  }

  function truncate(addr: string) {
    return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
  }
</script>

<div class="wallet-wrap">
  {#if $isConnected}
    <div class="wallet-info">
      <span class="wallet-dot" />
      <div class="wallet-text">
        <span class="wallet-addr mincho">{truncate($account)}</span>
        <span class="wallet-sub">Connected</span>
      </div>
    </div>
  {:else}
    <button class="connect-btn" on:click={handleConnect} disabled={connecting}>
      <span class="btn-ja">{connecting ? "接続中…" : "ウォレット接続"}</span>
      <span class="btn-en">{connecting ? "Connecting…" : "Connect Wallet"}</span
      >
    </button>
  {/if}
  {#if error}
    <p class="wallet-error">{error}</p>
  {/if}
</div>

<style>
  .wallet-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }
  .wallet-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    color: #fff;
    font-size: 0.85rem;
  }
  .wallet-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #7fff7a;
    box-shadow: 0 0 6px #7fff7a;
    flex-shrink: 0;
  }
  .wallet-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }
  .wallet-addr {
    letter-spacing: 0.03em;
    font-size: 0.85rem;
  }
  .wallet-sub {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.55);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* Ivory/cream button — visible against dark navy header */
  .connect-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(255, 255, 255, 0.92);
    color: var(--color-ink);
    border: none;
    padding: 0.35rem 1.1rem;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.15s;
    line-height: 1.25;
  }
  .connect-btn:hover:not(:disabled) {
    background: #fff;
  }
  .connect-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .btn-ja {
    font-family: var(--font-mincho);
    font-size: 0.9rem;
    font-weight: 700;
  }
  .btn-en {
    font-size: 0.65rem;
    color: var(--color-ink-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .wallet-error {
    font-size: 0.75rem;
    color: #ffc8c8;
  }
</style>
