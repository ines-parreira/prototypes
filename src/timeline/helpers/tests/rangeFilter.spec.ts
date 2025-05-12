import { TicketSummary } from '@gorgias/api-queries'

import { filterTicketsByRange, getRangeLabel } from '../rangeFilter'

describe('filterTicketsByRange', () => {
    const tickets: TicketSummary[] = [
        { created_datetime: '2023-01-01T00:00:00Z' } as TicketSummary,
        { created_datetime: '2023-06-01T00:00:00Z' } as TicketSummary,
        { created_datetime: '2023-12-31T23:59:59Z' } as TicketSummary,
    ]

    it('should filter tickets within the specified range', () => {
        const range = {
            start: new Date('2023-01-01').getTime(),
            end: new Date('2023-06-30').getTime(),
        }
        const result = filterTicketsByRange(tickets, range)
        expect(result).toHaveLength(2)
        expect(result).toEqual([
            { created_datetime: '2023-01-01T00:00:00Z' },
            { created_datetime: '2023-06-01T00:00:00Z' },
        ])
    })

    it('should return all tickets if range is not specified', () => {
        const range = { start: null, end: null }
        const result = filterTicketsByRange(tickets, range)
        expect(result).toHaveLength(3)
        expect(result).toEqual(tickets)
    })

    it('should filter tickets with only a start date', () => {
        const range = {
            start: new Date('2023-06-01').getTime(),
            end: null,
        }
        const result = filterTicketsByRange(tickets, range)
        expect(result).toHaveLength(2)
        expect(result).toEqual([
            { created_datetime: '2023-06-01T00:00:00Z' },
            { created_datetime: '2023-12-31T23:59:59Z' },
        ])
    })

    it('should filter tickets with only an end date', () => {
        const range = {
            start: null,
            end: new Date('2023-06-01').getTime(),
        }
        const result = filterTicketsByRange(tickets, range)
        expect(result).toHaveLength(2)
        expect(result).toEqual([
            { created_datetime: '2023-01-01T00:00:00Z' },
            { created_datetime: '2023-06-01T00:00:00Z' },
        ])
    })
})

describe('getRangeLabel', () => {
    it('should return "All time" if range start or end is not defined', () => {
        expect(getRangeLabel({ start: null, end: null }, 'YYYY-MM-DD')).toBe(
            'All time',
        )
        expect(
            getRangeLabel({ start: 1672531200000, end: null }, 'YYYY-MM-DD'),
        ).toBe('All time')
        expect(
            getRangeLabel({ start: null, end: 1672531200000 }, 'YYYY-MM-DD'),
        ).toBe('All time')
    })

    it('should return a single date if start and end are the same', () => {
        const range = { start: 1672531200000, end: 1672531200000 }
        const result = getRangeLabel(range, 'YYYY-MM-DD')
        expect(result).toBe('2023-01-01')
    })

    it('should return a range of dates if start and end are different', () => {
        const range = { start: 1672531200000, end: 1688169600000 }
        const result = getRangeLabel(range, 'YYYY-MM-DD')
        expect(result).toBe('2023-01-01 - 2023-07-01')
    })
})
