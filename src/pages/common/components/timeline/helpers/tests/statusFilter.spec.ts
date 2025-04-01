import { TicketSummary } from '@gorgias/api-queries'

import { FilterKey } from '../../types'
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
    } as TicketSummary
    const closedTicket = {
        id: 2,
        status: 'closed',
        snooze_datetime: null,
    } as TicketSummary
    const snoozedTicket = {
        id: 3,
        status: 'closed',
        snooze_datetime: '2023-01-01T00:00:00Z',
    } as TicketSummary
    const snoozedTicketWithNoStatus = {
        id: 4,
        status: undefined,
        snooze_datetime: '2023-01-01T00:00:00Z',
    } as TicketSummary

    const tickets: TicketSummary[] = [
        openTicket,
        closedTicket,
        snoozedTicket,
        snoozedTicketWithNoStatus,
    ]

    it('should return all tickets if all statuses are selected', () => {
        const selectedStatus: FilterKey[] = ['open', 'closed', 'snooze']
        const result = filterTicketsByStatus(tickets, selectedStatus)
        expect(result).toEqual(tickets)
    })

    it('should return tickets matching the selected status', () => {
        const selectedStatus: FilterKey[] = ['open']
        const result = filterTicketsByStatus(tickets, selectedStatus)
        expect(result).toEqual([openTicket])
    })

    it('should return snoozed tickets', () => {
        const selectedStatus: FilterKey[] = ['snooze']
        const result = filterTicketsByStatus(tickets, selectedStatus)
        expect(result).toEqual([snoozedTicket])
    })

    it('should return tickets matching multiple selected statuses', () => {
        const selectedStatus: FilterKey[] = ['open', 'closed']
        const result = filterTicketsByStatus(tickets, selectedStatus)
        expect(result).toEqual([openTicket, closedTicket])
    })

    it('should not return snoozed tickets if "close" is selected', () => {
        const selectedStatus: FilterKey[] = ['closed']
        const result = filterTicketsByStatus(tickets, selectedStatus)
        expect(result).toEqual([closedTicket])
    })

    it('should return an empty array if selectedStatus is empty', () => {
        const selectedStatus: FilterKey[] = []
        const result = filterTicketsByStatus(tickets, selectedStatus)
        expect(result).toEqual([])
    })
})
