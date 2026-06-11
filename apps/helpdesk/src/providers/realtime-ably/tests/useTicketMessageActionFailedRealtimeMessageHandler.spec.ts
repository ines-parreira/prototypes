import { appQueryClient } from '@repo/api-resources'
import { renderHook } from '@repo/testing'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { useAppDispatch } from 'hooks/useAppDispatch'
import * as ticketActions from 'state/ticket/actions'

import { useTicketMessageActionFailedRealtimeMessageHandler } from '../useTicketMessageActionFailedRealtimeMessageHandler'

jest.mock('hooks/useAppDispatch')
jest.mock('state/ticket/actions')

const mockUseAppDispatch = useAppDispatch as jest.Mock
type TicketMessageActionFailedRealtimeMessage = Parameters<
    ReturnType<
        typeof useTicketMessageActionFailedRealtimeMessageHandler
    >['handleTicketMessageActionFailedRealtimeMessage']
>[0]

describe('useTicketMessageActionFailedRealtimeMessageHandler', () => {
    const dispatch = jest.fn()

    beforeEach(() => {
        mockUseAppDispatch.mockReturnValue(dispatch)
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('invalidates ticket data and dispatches the action failure handler', () => {
        const invalidateQueriesSpy = jest
            .spyOn(appQueryClient, 'invalidateQueries')
            .mockResolvedValue()
        const { result } = renderHook(() =>
            useTicketMessageActionFailedRealtimeMessageHandler(),
        )

        result.current.handleTicketMessageActionFailedRealtimeMessage({
            name: 'ticket-message-action.failed',
            data: {
                ticket_id: 42,
            },
        } as TicketMessageActionFailedRealtimeMessage)

        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: queryKeys.tickets.getTicket(42),
        })
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: queryKeys.ticketMessages.listMessages({
                ticket_id: 42,
            }),
        })
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: queryKeys.customFields.all(),
        })
        expect(ticketActions.handleMessageActionError).toHaveBeenCalledWith(42)
        expect(dispatch).toHaveBeenCalled()
    })

    it('accepts the id from JSON message data', () => {
        const { result } = renderHook(() =>
            useTicketMessageActionFailedRealtimeMessageHandler(),
        )

        result.current.handleTicketMessageActionFailedRealtimeMessage({
            name: 'ticket-message-action.failed',
            data: JSON.stringify({
                ticket_id: '42',
            }),
        } as TicketMessageActionFailedRealtimeMessage)

        expect(ticketActions.handleMessageActionError).toHaveBeenCalledWith(42)
    })

    it('ignores failed messages without a valid id', () => {
        const { result } = renderHook(() =>
            useTicketMessageActionFailedRealtimeMessageHandler(),
        )

        result.current.handleTicketMessageActionFailedRealtimeMessage({
            name: 'ticket-message-action.failed',
            data: {},
        } as TicketMessageActionFailedRealtimeMessage)

        expect(ticketActions.handleMessageActionError).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
    })
})
