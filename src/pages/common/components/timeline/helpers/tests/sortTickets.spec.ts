import { TicketSummary } from '@gorgias/api-types'

import { SortOption } from '../../types'
import { sortTickets } from '../sortTickets'

describe('sortTickets', () => {
    const tickets: TicketSummary[] = [
        {
            id: 1,
            created_datetime: '2023-01-03T10:00:00Z',
            last_message_datetime: '2023-01-06T10:00:00Z',
        } as TicketSummary,
        {
            id: 2,
            created_datetime: '2023-01-02T10:00:00Z',
            last_message_datetime: '2023-01-05T10:00:00Z',
        } as TicketSummary,
        {
            id: 3,
            created_datetime: '2023-01-03T10:00:00Z',
            last_message_datetime: '2023-01-04T10:00:00Z',
        } as TicketSummary,
    ]

    it('should sort tickets in ascending order', () => {
        const sortOption: SortOption = {
            key: 'last_message_datetime',
            order: 'asc',
            label: 'Last message',
        }
        const sortedTickets = sortTickets(tickets, sortOption)
        expect(sortedTickets.map((ticket) => ticket.id)).toEqual([3, 2, 1])
    })

    it('should sort tickets in descending order', () => {
        const sortOption: SortOption = {
            key: 'last_message_datetime',
            order: 'desc',
            label: 'Last message',
        }
        const sortedTickets = sortTickets(tickets, sortOption)
        expect(sortedTickets.map((ticket) => ticket.id)).toEqual([1, 2, 3])
    })

    it('should use fallback sort key if the sort key is not present', () => {
        const sortOption: SortOption = {
            key: 'last_received_message_datetime',
            order: 'asc',
            label: 'Last message',
        }
        const sortedTickets = sortTickets(tickets, sortOption)
        expect(sortedTickets.map((ticket) => ticket.id)).toEqual([1, 2, 3])
    })

    it('should handle empty ticket list', () => {
        const sortOption: SortOption = {
            key: 'created_datetime',
            order: 'asc',
            label: 'Created',
        }
        const sortedTickets = sortTickets([], sortOption)
        expect(sortedTickets).toEqual([])
    })
})
