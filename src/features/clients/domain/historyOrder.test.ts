import { sortHistoryNewestFirst } from './historyOrder'
import type { HistoryEntry } from './client'

const entry = (id: string, at: string): HistoryEntry => ({ id, kind: 'note', text: id, at })

describe('sortHistoryNewestFirst', () => {
  it('orders by timestamp, newest first', () => {
    const sorted = sortHistoryNewestFirst([
      entry('a', '2026-10-01T10:00:00.000Z'),
      entry('c', '2026-10-03T10:00:00.000Z'),
      entry('b', '2026-10-02T10:00:00.000Z'),
    ])
    expect(sorted.map((e) => e.id)).toEqual(['c', 'b', 'a'])
  })

  it('puts the later insertion first when timestamps are equal', () => {
    const at = '2026-10-01T10:00:00.000Z'
    const sorted = sortHistoryNewestFirst([entry('first', at), entry('second', at), entry('third', at)])
    expect(sorted.map((e) => e.id)).toEqual(['third', 'second', 'first'])
  })

  it('does not mutate the input', () => {
    const input = [entry('a', '2026-10-01T10:00:00.000Z'), entry('b', '2026-10-02T10:00:00.000Z')]
    sortHistoryNewestFirst(input)
    expect(input.map((e) => e.id)).toEqual(['a', 'b'])
  })
})
