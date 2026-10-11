import type { HistoryEntry } from './client'

/** Newest first by timestamp; equal timestamps keep the later insertion first. */
export function sortHistoryNewestFirst(history: readonly HistoryEntry[]): HistoryEntry[] {
  return history
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      if (a.entry.at !== b.entry.at) return a.entry.at < b.entry.at ? 1 : -1
      return b.index - a.index
    })
    .map(({ entry }) => entry)
}
