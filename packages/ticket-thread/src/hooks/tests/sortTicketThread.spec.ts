import { sortTicketThreadItems } from '../sortTicketThread'

describe('sortTicketThreadItems', () => {
    it('sorts items by datetime ascending', () => {
        const items = [
            { _tag: 'b', datetime: '2024-03-21T11:03:00Z' },
            { _tag: 'a', datetime: '2024-03-21T11:01:00Z' },
            { _tag: 'c', datetime: '2024-03-21T11:02:00Z' },
        ] as any

        const sorted = sortTicketThreadItems(items)

        expect(sorted.map((item: any) => item._tag)).toEqual(['a', 'c', 'b'])
    })

    it('moves items without datetime to the end', () => {
        const items = [
            { _tag: 'with-datetime', datetime: '2024-03-21T11:03:00Z' },
            { _tag: 'without-datetime' },
            { _tag: 'with-earlier-datetime', datetime: '2024-03-21T11:01:00Z' },
        ] as any

        const sorted = sortTicketThreadItems(items)

        expect(sorted.map((item: any) => item._tag)).toEqual([
            'with-earlier-datetime',
            'with-datetime',
            'without-datetime',
        ])
    })
})
