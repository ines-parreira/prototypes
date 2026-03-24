import type * as loggingModule from '@repo/logging'
import { logEvent, SegmentEvent } from '@repo/logging'
import { renderHook } from '@testing-library/react'

import { useReasoningTracking } from '../useReasoningTracking'

vi.mock('@repo/logging', async () => {
    const actual = await vi.importActual<typeof loggingModule>('@repo/logging')

    return {
        ...actual,
        logEvent: vi.fn(),
    }
})

const mockLogEvent = vi.mocked(logEvent)

describe('useReasoningTracking', () => {
    const defaultProps = {
        ticketId: 123,
        accountId: 456,
        userId: 789,
        messageId: 321,
    }

    const expectedEventContext = {
        ticketId: defaultProps.ticketId,
        accountId: defaultProps.accountId,
        userId: defaultProps.userId,
        messageId: defaultProps.messageId,
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('when onReasoningOpened is called', () => {
        it('logs the correct event with context', () => {
            const { result } = renderHook(() =>
                useReasoningTracking(defaultProps),
            )

            result.current.onReasoningOpened()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentReasoningOpened,
                expectedEventContext,
            )
        })

        it('logs the event only once per call', () => {
            const { result } = renderHook(() =>
                useReasoningTracking(defaultProps),
            )

            result.current.onReasoningOpened()

            expect(mockLogEvent).toHaveBeenCalledTimes(1)
        })
    })

    describe('when hook props change', () => {
        it('updates the event context', () => {
            const { result, rerender } = renderHook(
                (props) => useReasoningTracking(props),
                { initialProps: defaultProps },
            )

            const newProps = {
                ticketId: 999,
                accountId: 888,
                userId: 777,
                messageId: 666,
            }

            rerender(newProps)

            result.current.onReasoningOpened()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentReasoningOpened,
                {
                    ticketId: newProps.ticketId,
                    accountId: newProps.accountId,
                    userId: newProps.userId,
                    messageId: newProps.messageId,
                },
            )
        })
    })

    describe('callback stability', () => {
        it('maintains callback reference when props do not change', () => {
            const { result, rerender } = renderHook(
                (props) => useReasoningTracking(props),
                { initialProps: defaultProps },
            )

            const firstCallback = result.current.onReasoningOpened

            rerender(defaultProps)

            const secondCallback = result.current.onReasoningOpened

            expect(firstCallback).toBe(secondCallback)
        })

        it('updates callback reference when props change', () => {
            const { result, rerender } = renderHook(
                (props) => useReasoningTracking(props),
                { initialProps: defaultProps },
            )

            const firstCallback = result.current.onReasoningOpened

            const newProps = {
                ticketId: 999,
                accountId: 888,
                userId: 777,
                messageId: 666,
            }

            rerender(newProps)

            const secondCallback = result.current.onReasoningOpened

            expect(firstCallback).not.toBe(secondCallback)
        })
    })
})
