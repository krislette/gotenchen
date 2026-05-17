<script lang="ts">
  import { toasts } from '../stores/toast';
</script>

<div class="toaster">
  {#each $toasts as toast (toast.id)}
    <div class="toast toast-{toast.type}">
      {toast.message}
    </div>
  {/each}
</div>

<style>
  .toaster {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 200;
  }
  .toast {
    padding: 0.65rem 1.1rem;
    border-radius: var(--radius);
    font-size: 0.875rem;
    font-family: var(--font-sans);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    max-width: 320px;
    animation: slide-in 0.2s ease;
  }
  .toast-success { background: #e6f4ee; color: var(--color-ratified); border: 1px solid #b2dfcc; }
  .toast-error   { background: #fdeaea; color: var(--color-rejected); border: 1px solid #f5b8b8; }
  @keyframes slide-in {
    from { opacity: 0; transform: translateX(1rem); }
    to   { opacity: 1; transform: translateX(0); }
  }
</style>
