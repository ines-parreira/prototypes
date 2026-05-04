import { renderHook } from '@repo/testing'

import { useCanSummarize } from '../useCanSummarize'

describe('useCanSummarize', () => {
    describe('when the thread has a handover message', () => {
        it('returns true when there are at least 2 messages after the handover', () => {
            const { result } = renderHook(() =>
                useCanSummarize({
                    hasHandoverMessage: true,
                    messagesAfterHandover: 2,
                    messageCount: 5,
                    hasInternalMessages: false,
                    hasExternalMessages: true,
                }),
            )

            expect(result.current).toBe(true)
        })

        it('returns true regardless of message type mix when after-handover threshold is met', () => {
            const { result } = renderHook(() =>
                useCanSummarize({
                    hasHandoverMessage: true,
                    messagesAfterHandover: 3,
                    messageCount: 5,
                    hasInternalMessages: false,
                    hasExternalMessages: false,
                }),
            )

            expect(result.current).toBe(true)
        })

        it('returns false when fewer than 2 messages followed the handover', () => {
            const { result } = renderHook(() =>
                useCanSummarize({
                    hasHandoverMessage: true,
                    messagesAfterHandover: 1,
                    messageCount: 5,
                    hasInternalMessages: true,
                    hasExternalMessages: true,
                }),
            )

            expect(result.current).toBe(false)
        })

        it('returns false when no messages followed the handover', () => {
            const { result } = renderHook(() =>
                useCanSummarize({
                    hasHandoverMessage: true,
                    messagesAfterHandover: 0,
                    messageCount: 3,
                    hasInternalMessages: true,
                    hasExternalMessages: true,
                }),
            )

            expect(result.current).toBe(false)
        })
    })

    describe('when there is no handover message', () => {
        const baseParams = {
            hasHandoverMessage: false,
            messagesAfterHandover: 0,
        }

        it('returns true with at least 4 messages and both internal and external types', () => {
            const { result } = renderHook(() =>
                useCanSummarize({
                    ...baseParams,
                    messageCount: 4,
                    hasInternalMessages: true,
                    hasExternalMessages: true,
                }),
            )

            expect(result.current).toBe(true)
        })

        it('returns true with more than 4 messages', () => {
            const { result } = renderHook(() =>
                useCanSummarize({
                    ...baseParams,
                    messageCount: 10,
                    hasInternalMessages: true,
                    hasExternalMessages: true,
                }),
            )

            expect(result.current).toBe(true)
        })

        it('returns false with fewer than 4 messages even when both types are present', () => {
            const { result } = renderHook(() =>
                useCanSummarize({
                    ...baseParams,
                    messageCount: 3,
                    hasInternalMessages: true,
                    hasExternalMessages: true,
                }),
            )

            expect(result.current).toBe(false)
        })

        it('returns false without internal messages', () => {
            const { result } = renderHook(() =>
                useCanSummarize({
                    ...baseParams,
                    messageCount: 4,
                    hasInternalMessages: false,
                    hasExternalMessages: true,
                }),
            )

            expect(result.current).toBe(false)
        })

        it('returns false without external messages', () => {
            const { result } = renderHook(() =>
                useCanSummarize({
                    ...baseParams,
                    messageCount: 4,
                    hasInternalMessages: true,
                    hasExternalMessages: false,
                }),
            )

            expect(result.current).toBe(false)
        })
    })
})
