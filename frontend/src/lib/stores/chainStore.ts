import { writable, derived } from 'svelte/store';
import type { BrowserProvider, JsonRpcSigner } from 'ethers';

export type TabId = 'browse' | 'propose' | 'vote';

export interface ChainEntry {
  id: number;
  katakana: string;
  romaji: string;
  donorLanguage: string;
  sourceWord: string;
  meaning: string;
  category: string;
  proposer: string;
  upvotes: number;
  downvotes: number;
  status: 0 | 1 | 2; // Pending | Ratified | Rejected
  timestamp: number;
}

// Wallet
export const provider  = writable<BrowserProvider | null>(null);
export const signer    = writable<JsonRpcSigner | null>(null);
export const account   = writable<string>('');
export const isConnected = derived(account, $a => $a !== '');

// UI
export const activeTab = writable<TabId>('browse');

// Chain data
export const entries  = writable<ChainEntry[]>([]);
export const loading  = writable(false);
export const txPending = writable(false);
