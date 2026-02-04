import { logEvent, SegmentEvent } from '@repo/logging'
import { renderHook } from '@testing-library/react'

import { useVersionHistoryTracking } from './useVersionHistoryTracking'

jest.mock('@repo/logging')

const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>

const defaultProps = {
    shopName: 'test-shop',
    resourceType: 'guidance' as const,
    resourceId: 42,
    helpCenterId: 100,
    locale: 'en-US',
}

const defaultVersionContext = {
    versionId: 7,
    versionNumber: 3,
    publishedDatetime: '2025-01-15T10:00:00Z',
}

describe('useVersionHistoryTracking', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return all tracking callbacks', () => {
        const { result } = renderHook(() =>
            useVersionHistoryTracking(defaultProps),
        )

        expect(result.current.onVersionViewed).toBeDefined()
        expect(result.current.onBackToCurrent).toBeDefined()
        expect(result.current.onVersionRestored).toBeDefined()
    })

    describe('onVersionViewed', () => {
        it('should log version viewed event with full context', () => {
            const { result } = renderHook(() =>
                useVersionHistoryTracking(defaultProps),
            )

            result.current.onVersionViewed(defaultVersionContext)

            expect(mockLogEvent).toHaveBeenCalledTimes(1)
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryVersionViewed,
                {
                    shopName: 'test-shop',
                    resourceType: 'guidance',
                    resourceId: 42,
                    helpCenterId: 100,
                    locale: 'en-US',
                    versionId: 7,
                    versionNumber: 3,
                    publishedDatetime: '2025-01-15T10:00:00Z',
                },
            )
        })

        it('should handle null publishedDatetime', () => {
            const { result } = renderHook(() =>
                useVersionHistoryTracking(defaultProps),
            )

            result.current.onVersionViewed({
                versionId: 7,
                versionNumber: 3,
                publishedDatetime: null,
            })

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryVersionViewed,
                expect.objectContaining({ publishedDatetime: null }),
            )
        })

        it('should handle article resource type', () => {
            const { result } = renderHook(() =>
                useVersionHistoryTracking({
                    ...defaultProps,
                    resourceType: 'article',
                }),
            )

            result.current.onVersionViewed(defaultVersionContext)

            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryVersionViewed,
                expect.objectContaining({ resourceType: 'article' }),
            )
        })
    })

    describe('onBackToCurrent', () => {
        it('should log back to current event with full context', () => {
            const { result } = renderHook(() =>
                useVersionHistoryTracking(defaultProps),
            )

            result.current.onBackToCurrent(defaultVersionContext)

            expect(mockLogEvent).toHaveBeenCalledTimes(1)
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryBackToCurrent,
                {
                    shopName: 'test-shop',
                    resourceType: 'guidance',
                    resourceId: 42,
                    helpCenterId: 100,
                    locale: 'en-US',
                    versionId: 7,
                    versionNumber: 3,
                    publishedDatetime: '2025-01-15T10:00:00Z',
                },
            )
        })
    })

    describe('onVersionRestored', () => {
        it('should log version restored event with full context', () => {
            const { result } = renderHook(() =>
                useVersionHistoryTracking(defaultProps),
            )

            result.current.onVersionRestored(defaultVersionContext)

            expect(mockLogEvent).toHaveBeenCalledTimes(1)
            expect(mockLogEvent).toHaveBeenCalledWith(
                SegmentEvent.AiAgentVersionHistoryVersionRestored,
                {
                    shopName: 'test-shop',
                    resourceType: 'guidance',
                    resourceId: 42,
                    helpCenterId: 100,
                    locale: 'en-US',
                    versionId: 7,
                    versionNumber: 3,
                    publishedDatetime: '2025-01-15T10:00:00Z',
                },
            )
        })
    })

    describe('callback stability', () => {
        it('should maintain stable callback references when props do not change', () => {
            const { result, rerender } = renderHook(() =>
                useVersionHistoryTracking(defaultProps),
            )

            const callbacks1 = { ...result.current }

            rerender()

            const callbacks2 = { ...result.current }

            expect(callbacks1.onVersionViewed).toBe(callbacks2.onVersionViewed)
            expect(callbacks1.onBackToCurrent).toBe(callbacks2.onBackToCurrent)
            expect(callbacks1.onVersionRestored).toBe(
                callbacks2.onVersionRestored,
            )
        })

        it('should update callbacks when shopName changes', () => {
            let shopName = 'shop-1'

            const { result, rerender } = renderHook(
                () => useVersionHistoryTracking({ ...defaultProps, shopName }),
                { initialProps: { shopName } },
            )

            const callback1 = result.current.onVersionViewed

            shopName = 'shop-2'
            rerender()

            const callback2 = result.current.onVersionViewed

            expect(callback1).not.toBe(callback2)
        })

        it('should update callbacks when resourceId changes', () => {
            let resourceId = 42

            const { result, rerender } = renderHook(
                () =>
                    useVersionHistoryTracking({
                        ...defaultProps,
                        resourceId,
                    }),
                { initialProps: { resourceId } },
            )

            const callback1 = result.current.onVersionViewed

            resourceId = 99
            rerender()

            const callback2 = result.current.onVersionViewed

            expect(callback1).not.toBe(callback2)
        })
    })

    describe('integration scenarios', () => {
        it('should handle a full version history workflow', () => {
            const { result } = renderHook(() =>
                useVersionHistoryTracking(defaultProps),
            )

            result.current.onVersionViewed(defaultVersionContext)
            result.current.onBackToCurrent(defaultVersionContext)
            result.current.onVersionViewed({
                versionId: 5,
                versionNumber: 2,
                publishedDatetime: '2025-01-10T10:00:00Z',
            })
            result.current.onVersionRestored({
                versionId: 5,
                versionNumber: 2,
                publishedDatetime: '2025-01-10T10:00:00Z',
            })

            expect(mockLogEvent).toHaveBeenCalledTimes(4)
            expect(mockLogEvent).toHaveBeenNthCalledWith(
                1,
                SegmentEvent.AiAgentVersionHistoryVersionViewed,
                expect.objectContaining({ versionId: 7 }),
            )
            expect(mockLogEvent).toHaveBeenNthCalledWith(
                2,
                SegmentEvent.AiAgentVersionHistoryBackToCurrent,
                expect.objectContaining({ versionId: 7 }),
            )
            expect(mockLogEvent).toHaveBeenNthCalledWith(
                3,
                SegmentEvent.AiAgentVersionHistoryVersionViewed,
                expect.objectContaining({ versionId: 5 }),
            )
            expect(mockLogEvent).toHaveBeenNthCalledWith(
                4,
                SegmentEvent.AiAgentVersionHistoryVersionRestored,
                expect.objectContaining({ versionId: 5 }),
            )
        })
    })
})
