import { TicketCompact } from '@gorgias/api-types'

import { SortOption } from '../../types'
import { sortTickets } from '../sortTickets'

describe('sortTickets', () => {
    const tickets: TicketCompact[] = [
        {
            id: 1,
            created_datetime: '2023-01-03T10:00:00Z',
            last_message_datetime: '2023-01-06T10:00:00Z',
        } as TicketCompact,
        {
            id: 2,
            created_datetime: '2023-01-02T10:00:00Z',
            last_message_datetime: '2023-01-05T10:00:00Z',
        } as TicketCompact,
        {
            id: 3,
            created_datetime: '2023-01-04T10:00:00Z',
            last_message_datetime: '2024-01-05T10:00:00Z',
        } as TicketCompact,
        {
            id: 4,
            created_datetime: '2023-01-03T10:00:00Z',
            last_message_datetime: '2023-01-04T10:00:00Z',
        } as TicketCompact,
    ]

    it('should sort tickets in ascending order', () => {
        const sortOption: SortOption = {
            key: 'last_message_datetime',
            order: 'asc',
            label: 'Last message',
        }
        const sortedTickets = sortTickets(tickets, sortOption)
        expect(sortedTickets.map((ticket) => ticket.id)).toEqual([4, 2, 1, 3])
    })

    it('should sort tickets in descending order', () => {
        const sortOption: SortOption = {
            key: 'last_message_datetime',
            order: 'desc',
            label: 'Last message',
        }
        const sortedTickets = sortTickets(tickets, sortOption)
        expect(sortedTickets.map((ticket) => ticket.id)).toEqual([3, 1, 2, 4])
    })

    it('should use fallback sort key if the sort key is not present', () => {
        const sortOption: SortOption = {
            key: 'last_received_message_datetime',
            order: 'asc',
            label: 'Last message',
        }
        const sortedTickets = sortTickets(tickets, sortOption)
        expect(sortedTickets.map((ticket) => ticket.id)).toEqual([2, 1, 4, 3])
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
