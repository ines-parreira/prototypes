import { sortByDisplayOrder } from '../sortByDisplayOrder'

describe('sortByDisplayOrder', () => {
    it('sorts items by display_order from the ordering map', () => {
        const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
        const ordering = {
            '1': { display_order: 3 },
            '2': { display_order: 1 },
            '3': { display_order: 2 },
        }

        expect(sortByDisplayOrder(items, ordering)).toEqual([
            { id: 2 },
            { id: 3 },
            { id: 1 },
        ])
    })

    it('places items without ordering at the end', () => {
        const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
        const ordering = {
            '1': { display_order: 2 },
            '3': { display_order: 1 },
        }

        expect(sortByDisplayOrder(items, ordering)).toEqual([
            { id: 3 },
            { id: 1 },
            { id: 2 },
        ])
    })

    it('returns items unchanged when ordering is undefined', () => {
        const items = [{ id: 1 }, { id: 2 }]

        expect(sortByDisplayOrder(items, undefined)).toEqual([
            { id: 1 },
            { id: 2 },
        ])
    })

    it('does not mutate the original array', () => {
        const items = [{ id: 1 }, { id: 2 }]
        const ordering = {
            '1': { display_order: 2 },
            '2': { display_order: 1 },
        }

        const result = sortByDisplayOrder(items, ordering)

        expect(result).not.toBe(items)
        expect(items).toEqual([{ id: 1 }, { id: 2 }])
    })
})
