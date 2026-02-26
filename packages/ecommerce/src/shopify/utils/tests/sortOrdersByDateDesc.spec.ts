import { describe, expect, it } from 'vitest'

import { sortOrdersByDateDesc } from '../sortOrdersByDateDesc'

function wrap(date: string) {
    return { order: { created_at: date } }
}

function dates(items: { order: { created_at: string } }[]) {
    return items.map((i) => i.order.created_at)
}

describe('sortOrdersByDateDesc', () => {
    it.each([
        ['already sorted', ['2025-03-01', '2025-02-01', '2025-01-01']],
        ['reverse order', ['2025-01-01', '2025-02-01', '2025-03-01']],
        ['same dates', ['2025-01-01', '2025-01-01']],
    ])('should sort descending when %s', (_, input) => {
        const result = sortOrdersByDateDesc(input.map(wrap))
        const sorted = [...input].sort(
            (a, b) => new Date(b).getTime() - new Date(a).getTime(),
        )
        expect(dates(result)).toEqual(sorted)
    })

    it('should push NaN dates to the end', () => {
        const result = sortOrdersByDateDesc([
            wrap('invalid'),
            wrap('2025-01-01'),
        ])
        expect(dates(result)).toEqual(['2025-01-01', 'invalid'])
    })

    it('should keep both NaN dates in place relative to each other', () => {
        const result = sortOrdersByDateDesc([wrap('bad1'), wrap('bad2')])
        expect(dates(result)).toEqual(['bad1', 'bad2'])
    })

    it.each([
        ['empty array', []],
        ['single item', [wrap('2025-01-01')]],
    ])('should handle %s', (_, input) => {
        expect(sortOrdersByDateDesc(input)).toEqual(input)
    })

    it('should not mutate the original array', () => {
        const original = [wrap('2025-01-01'), wrap('2025-03-01')]
        sortOrdersByDateDesc(original)
        expect(dates(original)).toEqual(['2025-01-01', '2025-03-01'])
    })
})
