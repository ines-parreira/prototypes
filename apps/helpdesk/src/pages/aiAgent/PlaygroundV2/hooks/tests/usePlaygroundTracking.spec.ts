import { renderHook } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'

import { usePlaygroundTracking } from '../usePlaygroundTracking'

jest.mock('common/segment')

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

describe('usePlaygroundTracking', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should track test page viewed event with shop name', () => {
        const { result } = renderHook(() =>
            usePlaygroundTracking({ shopName: 'test-shop' }),
        )

        result.current.onTestPageViewed()

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentTestPageViewed,
            { shopName: 'test-shop' },
        )
    })

    it('should track test message sent event with all parameters', () => {
        const { result } = renderHook(() =>
            usePlaygroundTracking({ shopName: 'test-shop' }),
        )

        result.current.onTestMessageSent({
            channel: 'email',
            playgroundSettings: 'default',
        })

        expect(mockLogEvent).toHaveBeenCalledWith(
            SegmentEvent.AiAgentTestMessageSent,
            {
                shopName: 'test-shop',
                channel: 'email',
                playgroundSettings: 'default',
            },
        )
    })

    it('should include shop name in event context for message sent', () => {
        const { result } = renderHook(() =>
            usePlaygroundTracking({ shopName: 'my-store' }),
        )

        result.current.onTestMessageSent({
            channel: 'chat',
            playgroundSettings: 'custom',
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
            { shopName: 'test-shop' },
        )
        expect(mockLogEvent).toHaveBeenNthCalledWith(
            2,
            SegmentEvent.AiAgentTestPageViewed,
            { shopName: 'test-shop' },
        )
    })

    it('should track multiple message sends with different parameters', () => {
        const { result } = renderHook(() =>
            usePlaygroundTracking({ shopName: 'test-shop' }),
        )

        result.current.onTestMessageSent({
            channel: 'email',
            playgroundSettings: 'default',
        })

        result.current.onTestMessageSent({
            channel: 'chat',
            playgroundSettings: 'custom',
        })

        expect(mockLogEvent).toHaveBeenCalledTimes(2)
        expect(mockLogEvent).toHaveBeenNthCalledWith(
            1,
            SegmentEvent.AiAgentTestMessageSent,
            {
                shopName: 'test-shop',
                channel: 'email',
                playgroundSettings: 'default',
            },
        )
        expect(mockLogEvent).toHaveBeenNthCalledWith(
            2,
            SegmentEvent.AiAgentTestMessageSent,
            {
                shopName: 'test-shop',
                channel: 'chat',
                playgroundSettings: 'custom',
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
            { shopName: '' },
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
            { shopName: 'shop-1' },
        )

        rerender({ shopName: 'shop-2' })

        result.current.onTestPageViewed()

        expect(mockLogEvent).toHaveBeenLastCalledWith(
            SegmentEvent.AiAgentTestPageViewed,
            { shopName: 'shop-2' },
        )
    })
})
