import { QueryClient } from '@tanstack/react-query'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { toast } from '@gorgias/axiom'
import type { DomainEvent, DomainEventWithType } from '@gorgias/events'
import { queryKeys } from '@gorgias/helpdesk-queries'

import { renderHook } from '../../../../tests/render.utils'
import { TICKET_THREAD_MESSAGES_PAGE_LIMIT } from '../../../../ticket-messages/hooks/useListTicketMessages'
import { useRealtimeTicketUpdates } from '../useRealtimeTicketUpdates'
import { useTicketMessageCreatedSignalHandler } from '../useTicketMessageCreatedSignalHandler'

vi.mock('../useTicketMessageCreatedSignalHandler', () => ({
    useTicketMessageCreatedSignalHandler: vi.fn(),
}))

function createTicketMessageCreatedSignalEvent(
    overrides?: Partial<
        DomainEventWithType<'//helpdesk/ui.ticket-message.created-signal'>['data']
    >,
    eventOverrides?: Partial<
        DomainEventWithType<'//helpdesk/ui.ticket-message.created-signal'>
    >,
): DomainEventWithType<'//helpdesk/ui.ticket-message.created-signal'> {
    return {
        id: 'event-1',
        dataschema: '//helpdesk/ui.ticket-message.created-signal/1.0.0',
        type: 'ui.ticket-message.created-signal',
        source: 'helpdesk',
        subject: 'ticket-123',
        data: {
            id: 10,
            ticket_id: 123,
            user_id: 1,
            ...overrides,
        },
        ...eventOverrides,
    }
}

const mockUseTicketMessageCreatedSignalHandler = vi.mocked(
    useTicketMessageCreatedSignalHandler,
)

describe('useRealtimeTicketUpdates', () => {
    beforeAll(() => {
        Element.prototype.setPointerCapture = vi.fn()
        Element.prototype.releasePointerCapture = vi.fn()
    })

    afterEach(() => {
        vi.clearAllMocks()
        act(() => {
            toast.dismiss()
        })
    })

    it('ignores events that are not ticket message created signals', () => {
        const handleTicketMessageCreatedSignal = vi.fn()

        mockUseTicketMessageCreatedSignalHandler.mockReturnValue({
            handleTicketMessageCreatedSignal,
        })

        const { result } = renderHook(() =>
            useRealtimeTicketUpdates({ ticketId: 123 }),
        )

        result.current.handleTicketUpdateEvents({
            id: 'event-other',
            type: 'ui.ticket.updated',
            dataschema: '//helpdesk/ui.ticket.updated/1.0.0',
            source: 'helpdesk',
            subject: 'ticket-123',
            data: {},
        } as unknown as DomainEvent)

        expect(handleTicketMessageCreatedSignal).not.toHaveBeenCalled()
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('forwards ticket message created signals to handleTicketMessageCreatedSignal', async () => {
        const handleTicketMessageCreatedSignal = vi
            .fn()
            .mockResolvedValue(undefined)
        const event = createTicketMessageCreatedSignalEvent()

        mockUseTicketMessageCreatedSignalHandler.mockReturnValue({
            handleTicketMessageCreatedSignal,
        })

        const { result } = renderHook(() =>
            useRealtimeTicketUpdates({ ticketId: 123 }),
        )

        act(() => {
            result.current.handleTicketUpdateEvents(event)
        })

        await waitFor(() => {
            expect(handleTicketMessageCreatedSignal).toHaveBeenCalledWith(event)
        })
        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('shows a toast and refetches the ticket thread when realtime message fetching fails', async () => {
        const user = userEvent.setup()
        const handleTicketMessageCreatedSignal = vi
            .fn()
            .mockRejectedValue(new Error('boom'))
        const refetchQueriesSpy = vi
            .spyOn(QueryClient.prototype, 'refetchQueries')
            .mockResolvedValue(undefined)

        mockUseTicketMessageCreatedSignalHandler.mockReturnValue({
            handleTicketMessageCreatedSignal,
        })

        const { result } = renderHook(() =>
            useRealtimeTicketUpdates({ ticketId: 123 }),
        )

        act(() => {
            result.current.handleTicketUpdateEvents(
                createTicketMessageCreatedSignalEvent(),
            )
        })

        const toastElement = await screen.findByRole('status')
        expect(toastElement).toHaveTextContent(
            'Failed to fetch latest message(s).',
        )

        await user.click(
            within(toastElement).getByRole('button', {
                name: 'Refetch ticket thread',
            }),
        )

        expect(refetchQueriesSpy).toHaveBeenCalledWith({
            queryKey: queryKeys.ticketMessages.listAllMessages({
                ticket_id: 123,
                limit: TICKET_THREAD_MESSAGES_PAGE_LIMIT,
            }),
        })
    })
})
