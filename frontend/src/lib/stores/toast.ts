import { writable } from "svelte/store";

export type Toast = { id: number; message: string; type: "success" | "error" };

export const toasts = writable<Toast[]>([]);

let _id = 0;
export function showToast(
  message: string,
  type: "success" | "error",
  duration = 4000,
) {
  const id = _id++;
  toasts.update((t) => [...t, { id, message, type }]);
  setTimeout(
    () => toasts.update((t) => t.filter((x) => x.id !== id)),
    duration,
  );
}
