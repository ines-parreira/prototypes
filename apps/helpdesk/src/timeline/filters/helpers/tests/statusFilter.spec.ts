import { TicketCompact } from '@gorgias/helpdesk-queries'

import { FilterKey, TimelineItem, TimelineItemKind } from '../../../types'
import { filterTicketsByStatus, getOptionLabels } from '../statusFilter'

describe('getOptionLabels', () => {
    it('should return the correct labels for selected statuses', () => {
        const selectedStatus: FilterKey[] = ['open', 'closed']
        const result = getOptionLabels(selectedStatus)
        expect(result).toEqual(['Open', 'Closed'])
    })

    it('should return an empty array if no statuses are selected', () => {
        const selectedStatus: FilterKey[] = []
        const result = getOptionLabels(selectedStatus)
        expect(result).toEqual([])
    })

    it('should return labels in the same order as the selected statuses', () => {
        const selectedStatus: FilterKey[] = ['snooze', 'open']
        const result = getOptionLabels(selectedStatus)
        expect(result).toEqual(['Snoozed', 'Open'])
    })

    it('should handle a case where all statuses are selected', () => {
        const selectedStatus: FilterKey[] = ['open', 'closed', 'snooze']
        const result = getOptionLabels(selectedStatus)
        expect(result).toEqual(['All'])
    })

    it('should handle unmatched values', () => {
        const selectedStatus: FilterKey[] = ['open', 'unknown' as FilterKey]
        const result = getOptionLabels(selectedStatus)
        expect(result).toEqual(['Open'])
    })
})

describe('filterTicketsByStatus', () => {
    const openTicket = {
        id: 1,
        status: 'open',
        snooze_datetime: null,
    } as TicketCompact
    const closedTicket = {
        id: 2,
        status: 'closed',
        snooze_datetime: null,
    } as TicketCompact
    const snoozedTicket = {
        id: 3,
        status: 'closed',
        snooze_datetime: '2023-01-01T00:00:00Z',
    } as TicketCompact
    const snoozedTicketWithNoStatus = {
        id: 4,
        status: undefined,
        snooze_datetime: '2023-01-01T00:00:00Z',
    } as TicketCompact

    const tickets: TimelineItem[] = [
        { kind: TimelineItemKind.Ticket, ticket: openTicket },
        { kind: TimelineItemKind.Ticket, ticket: closedTicket },
        { kind: TimelineItemKind.Ticket, ticket: snoozedTicket },
        { kind: TimelineItemKind.Ticket, ticket: snoozedTicketWithNoStatus },
    ]

    it('should return all tickets if all statuses are selected', () => {
        const selectedStatus: FilterKey[] = ['open', 'closed', 'snooze']
        const result = filterTicketsByStatus(tickets, selectedStatus)
        expect(result).toEqual(tickets)
    })

    it('should return tickets matching the selected status', () => {
        const selectedStatus: FilterKey[] = ['open']
        const result = filterTicketsByStatus(tickets, selectedStatus)
        expect(result).toEqual([tickets[0]])
    })

    it('should return snoozed tickets', () => {
        const selectedStatus: FilterKey[] = ['snooze']
        const result = filterTicketsByStatus(tickets, selectedStatus)
        expect(result).toEqual([tickets[2]])
    })

    it('should return tickets matching multiple selected statuses', () => {
        const selectedStatus: FilterKey[] = ['open', 'closed']
        const result = filterTicketsByStatus(tickets, selectedStatus)
        expect(result).toEqual([tickets[0], tickets[1]])
    })

    it('should not return snoozed tickets if "close" is selected', () => {
        const selectedStatus: FilterKey[] = ['closed']
        const result = filterTicketsByStatus(tickets, selectedStatus)
        expect(result).toEqual([tickets[1]])
    })

    it('should return an empty array if selectedStatus is empty', () => {
        const selectedStatus: FilterKey[] = []
        const result = filterTicketsByStatus(tickets, selectedStatus)
        expect(result).toEqual([])
    })
})
