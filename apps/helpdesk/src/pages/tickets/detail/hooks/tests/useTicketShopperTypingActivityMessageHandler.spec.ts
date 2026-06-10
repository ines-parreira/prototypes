import { renderHook } from '@repo/testing'

import useAppDispatch from 'hooks/useAppDispatch'
import { setTypingActivityShopper } from 'state/ticket/actions'

import { useTicketShopperTypingActivityMessageHandler } from '../useTicketShopperTypingActivityMessageHandler'

jest.mock('hooks/useAppDispatch')
jest.mock('state/ticket/actions', () => ({
    setTypingActivityShopper: jest.fn((ticketId: number) => ({
        payload: ticketId,
        type: 'SET_TYPING_ACTIVITY_SHOPPER',
    })),
}))

const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockSetTypingActivityShopper = setTypingActivityShopper as jest.Mock
type AblyMessage = Parameters<
    ReturnType<
        typeof useTicketShopperTypingActivityMessageHandler
    >['handleMessage']
>[0]

function makeAblyMessage(name: string): AblyMessage {
    return { name } as AblyMessage
}

describe('useTicketShopperTypingActivityMessageHandler', () => {
    const dispatch = jest.fn()

    beforeEach(() => {
        dispatch.mockClear()
        mockSetTypingActivityShopper.mockClear()
        mockUseAppDispatch.mockReturnValue(dispatch)
    })

    it('dispatches shopper typing activity for the current ticket when the Ably event is received', () => {
        const { result } = renderHook(() =>
            useTicketShopperTypingActivityMessageHandler({
                ticketId: 1,
            }),
        )

        result.current.handleMessage(
            makeAblyMessage('ticket-typing-activity-shopper.started'),
        )

        expect(mockSetTypingActivityShopper).toHaveBeenCalledWith(1)
        expect(dispatch).toHaveBeenCalledWith({
            payload: 1,
            type: 'SET_TYPING_ACTIVITY_SHOPPER',
        })
    })

    it('ignores unrelated Ably events', () => {
        const { result } = renderHook(() =>
            useTicketShopperTypingActivityMessageHandler({
                ticketId: 1,
            }),
        )

        result.current.handleMessage(makeAblyMessage('ticket.updated'))

        expect(mockSetTypingActivityShopper).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
    })

    it('ignores the event when there is no valid ticket id', () => {
        const { result } = renderHook(() =>
            useTicketShopperTypingActivityMessageHandler({
                ticketId: Number.NaN,
            }),
        )

        result.current.handleMessage(
            makeAblyMessage('ticket-typing-activity-shopper.started'),
        )

        expect(mockSetTypingActivityShopper).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
    })
})
