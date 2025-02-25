import { MutableRefObject } from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { VirtuosoHandle } from 'react-virtuoso'

import { TicketSummary } from 'ticket-list-view/types'

import useScrollActiveTicketIntoView from '../useScrollActiveTicketIntoView'

type HookParams = {
    ticketId: number | undefined
    tickets: TicketSummary[]
    ticketIds: MutableRefObject<number[]>
    virtuosoRef: MutableRefObject<VirtuosoHandle | null>
}
describe('useScrollActiveTicketIntoView', () => {
    const mockTicketId = 123
    const mockTickets = [
        {
            id: mockTicketId,
        },
    ] as TicketSummary[]
    const mockTicketIds = { current: [mockTicketId] }
    const mockScrollIntoView = jest.fn()
    const mockVirtuosoRef = {
        current: {
            scrollIntoView: mockScrollIntoView,
        } as unknown as VirtuosoHandle,
    }

    it('should pre-scroll the active ticket into view', async () => {
        const { rerender, waitFor } = renderHook<HookParams, void>(
            ({ ticketId, tickets, ticketIds, virtuosoRef }) =>
                useScrollActiveTicketIntoView(
                    ticketId,
                    tickets,
                    ticketIds,
                    virtuosoRef,
                ),
            {
                initialProps: {
                    ticketId: mockTicketId,
                    tickets: [],
                    ticketIds: mockTicketIds,
                    virtuosoRef: mockVirtuosoRef,
                },
            },
        )
        rerender({
            ticketId: mockTicketId,
            tickets: mockTickets,
            ticketIds: mockTicketIds,
            virtuosoRef: mockVirtuosoRef,
        })
        await waitFor(() => {
            expect(mockScrollIntoView).toHaveBeenCalledWith({
                index: 0,
                behavior: undefined,
                align: 'center',
            })
        })
    })

    it('should scroll the new active ticket into view', () => {
        const { rerender } = renderHook<HookParams, void>(
            ({ ticketId, tickets, ticketIds, virtuosoRef }) =>
                useScrollActiveTicketIntoView(
                    ticketId,
                    tickets,
                    ticketIds,
                    virtuosoRef,
                ),
            {
                initialProps: {
                    ticketId: undefined,
                    tickets: mockTickets,
                    ticketIds: mockTicketIds,
                    virtuosoRef: mockVirtuosoRef,
                },
            },
        )

        rerender({
            ticketId: mockTicketId,
            tickets: mockTickets,
            ticketIds: mockTicketIds,
            virtuosoRef: mockVirtuosoRef,
        })
        expect(mockScrollIntoView).toHaveBeenCalledWith({
            index: 0,
            behavior: 'smooth',
            align: 'center',
        })
    })
})
