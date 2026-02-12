import { logEvent, SegmentEvent } from '@repo/logging'
import { renderHook } from '@testing-library/react'

import { usePlaygroundTracking } from '../usePlaygroundTracking'

jest.mock('@repo/logging')

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

describe('usePlaygroundTracking', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should track test page viewed event with shop name and current path', () => {
        const { result } = renderHook(() =>
            usePlaygroundTracking({ shopName: 'test-shop' }),
        )

        result.current.onTestPageViewed()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentTestPageViewed,
            {
                shopName: 'test-shop',
                currentPath: window.location.pathname,
            },
        )
    })

    it('should track test message sent event with all parameters', () => {
        const { result } = renderHook(() =>
            usePlaygroundTracking({ shopName: 'test-shop' }),
        )

        result.current.onTestMessageSent({
            channel: 'email',
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentTestMessageSent,
            {
                shopName: 'test-shop',
                currentPath: window.location.pathname,
                channel: 'email',
            },
        )
    })

    it('should include shop name in event context for message sent', () => {
        const { result } = renderHook(() =>
            usePlaygroundTracking({ shopName: 'my-store' }),
        )

        result.current.onTestMessageSent({
            channel: 'chat',
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentTestMessageSent,
            expect.objectContaining({
                shopName: 'my-store',
            }),
        )
    })

    it('should track multiple page views', () => {
        const { result } = renderHook(() =>
            usePlaygroundTracking({ shopName: 'test-shop' }),
        )

        result.current.onTestPageViewed()
        result.current.onTestPageViewed()

        expect(mockLogEvent).toHaveBeenCalledTimes(2)
        expect(mockLogEvent).toHaveBeenNthCalledWith(
            1,
            SegmentEvent.AiAgentTestPageViewed,
            {
                shopName: 'test-shop',
                currentPath: window.location.pathname,
            },
        )
        expect(mockLogEvent).toHaveBeenNthCalledWith(
            2,
            SegmentEvent.AiAgentTestPageViewed,
            {
                shopName: 'test-shop',
                currentPath: window.location.pathname,
            },
        )
    })

    it('should track multiple message sends with different parameters', () => {
        const { result } = renderHook(() =>
            usePlaygroundTracking({ shopName: 'test-shop' }),
        )

        result.current.onTestMessageSent({
            channel: 'email',
        })

        result.current.onTestMessageSent({
            channel: 'chat',
        })

        expect(mockLogEvent).toHaveBeenCalledTimes(2)
        expect(mockLogEvent).toHaveBeenNthCalledWith(
            1,
            SegmentEvent.AiAgentTestMessageSent,
            {
                shopName: 'test-shop',
                currentPath: window.location.pathname,
                channel: 'email',
            },
        )
        expect(mockLogEvent).toHaveBeenNthCalledWith(
            2,
            SegmentEvent.AiAgentTestMessageSent,
            {
                shopName: 'test-shop',
                currentPath: window.location.pathname,
                channel: 'chat',
            },
        )
    })

    it('should handle empty shop name', () => {
        const { result } = renderHook(() =>
            usePlaygroundTracking({ shopName: '' }),
        )

        result.current.onTestPageViewed()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentTestPageViewed,
            {
                shopName: '',
                currentPath: window.location.pathname,
            },
        )
    })

    it('should maintain stable callback references', () => {
        const { result, rerender } = renderHook(() =>
            usePlaygroundTracking({ shopName: 'test-shop' }),
        )

        const firstOnTestPageViewed = result.current.onTestPageViewed
        const firstOnTestMessageSent = result.current.onTestMessageSent

        rerender()

        expect(result.current.onTestPageViewed).toBe(firstOnTestPageViewed)
        expect(result.current.onTestMessageSent).toBe(firstOnTestMessageSent)
    })

    it('should update event context when shop name changes', () => {
        const { result, rerender } = renderHook(
            ({ shopName }) => usePlaygroundTracking({ shopName }),
            { initialProps: { shopName: 'shop-1' } },
        )

        result.current.onTestPageViewed()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentTestPageViewed,
            expect.objectContaining({ shopName: 'shop-1' }),
        )

        rerender({ shopName: 'shop-2' })

        result.current.onTestPageViewed()

        expect(mockLogEvent).toHaveBeenLastCalledWith(
            SegmentEvent.AiAgentTestPageViewed,
            expect.objectContaining({ shopName: 'shop-2' }),
        )
    })

    describe('onPlaygroundReset', () => {
        it('should track playground reset event with shop name and current path', () => {
            const { result } = renderHook(() =>
                usePlaygroundTracking({ shopName: 'test-shop' }),
            )

            result.current.onPlaygroundReset()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentTestReset,
                {
                    shopName: 'test-shop',
                    currentPath: window.location.pathname,
                },
            )
        })

        it('should include current path in event context', () => {
            const { result } = renderHook(() =>
                usePlaygroundTracking({ shopName: 'my-store' }),
            )

            result.current.onPlaygroundReset()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentTestReset,
                expect.objectContaining({
                    currentPath: window.location.pathname,
                }),
            )
        })

        it('should track multiple playground resets', () => {
            const { result } = renderHook(() =>
                usePlaygroundTracking({ shopName: 'test-shop' }),
            )

            result.current.onPlaygroundReset()
            result.current.onPlaygroundReset()

            expect(mockLogEvent).toHaveBeenCalledTimes(2)
            expect(mockLogEvent).toHaveBeenNthCalledWith(
                1,
                SegmentEvent.AiAgentTestReset,
                {
                    shopName: 'test-shop',
                    currentPath: window.location.pathname,
                },
            )
            expect(mockLogEvent).toHaveBeenNthCalledWith(
                2,
                SegmentEvent.AiAgentTestReset,
                {
                    shopName: 'test-shop',
                    currentPath: window.location.pathname,
                },
            )
        })

        it('should handle empty shop name for reset event', () => {
            const { result } = renderHook(() =>
                usePlaygroundTracking({ shopName: '' }),
            )

            result.current.onPlaygroundReset()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentTestReset,
                {
                    shopName: '',
                    currentPath: window.location.pathname,
                },
            )
        })

        it('should maintain stable callback reference for onPlaygroundReset', () => {
            const { result, rerender } = renderHook(() =>
                usePlaygroundTracking({ shopName: 'test-shop' }),
            )

            const firstOnPlaygroundReset = result.current.onPlaygroundReset

            rerender()

            expect(result.current.onPlaygroundReset).toBe(
                firstOnPlaygroundReset,
            )
        })

        it('should update event context when shop name changes for reset event', () => {
            const { result, rerender } = renderHook(
                ({ shopName }) => usePlaygroundTracking({ shopName }),
                { initialProps: { shopName: 'shop-1' } },
            )

            result.current.onPlaygroundReset()

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentTestReset,
                {
                    shopName: 'shop-1',
                    currentPath: window.location.pathname,
                },
            )

            rerender({ shopName: 'shop-2' })

            result.current.onPlaygroundReset()

            expect(mockLogEvent).toHaveBeenLastCalledWith(
                SegmentEvent.AiAgentTestReset,
                {
                    shopName: 'shop-2',
                    currentPath: window.location.pathname,
                },
            )
        })
    })
})
