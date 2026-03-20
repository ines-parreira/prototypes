import { renderHook } from '@testing-library/react'

import { useAIJourneyOptOutAfterReply } from 'AIJourney/hooks/useAIJourneyOptOutAfterReply/useAIJourneyOptOutAfterReply'
import { useAIJourneyTotalReplies } from 'AIJourney/hooks/useAIJourneyTotalReplies/useAIJourneyTotalReplies'

import { useAIJourneyOptOutAfterReplyRate } from './useAIJourneyOptOutAfterReplyRate'

jest.mock(
    'AIJourney/hooks/useAIJourneyOptOutAfterReply/useAIJourneyOptOutAfterReply',
)
jest.mock('AIJourney/hooks/useAIJourneyTotalReplies/useAIJourneyTotalReplies')

const mockUseAIJourneyTotalReplies = useAIJourneyTotalReplies as jest.Mock
const mockUseAIJourneyOptOutAfterReply =
    useAIJourneyOptOutAfterReply as jest.Mock

const mockFilters = {
    period: {
        start_datetime: '2025-07-03T00:00:00Z',
        end_datetime: '2025-07-31T23:59:59Z',
    },
}

const makeOptOutAfterReplyTrend = (overrides = {}) => ({
    trend: {
        isFetching: false,
        isError: false,
        data: { label: 'Opted-out after reply', value: 30, prevValue: 15 },
        ...overrides,
    },
})

const makeTotalRepliesTrend = (overrides = {}) => ({
    trend: {
        isFetching: false,
        isError: false,
        data: { label: 'Recipients who replied', value: 100, prevValue: 75 },
        ...overrides,
    },
})

describe('useAIJourneyOptOutAfterReplyRate', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAIJourneyOptOutAfterReply.mockReturnValue(
            makeOptOutAfterReplyTrend(),
        )
        mockUseAIJourneyTotalReplies.mockReturnValue(makeTotalRepliesTrend())
    })

    it('should return computed rate when both hooks have data', () => {
        const { result } = renderHook(() =>
            useAIJourneyOptOutAfterReplyRate({
                integrationId: '123',
                userTimezone: 'America/New_York',
                filters: mockFilters,
                journeyIds: ['journey-1'],
            }),
        )

        expect(result.current).toEqual({
            trend: {
                isFetching: false,
                isError: false,
                data: {
                    label: 'Opt-out rate after reply',
                    value: 30, // 30 / 100 * 100
                    prevValue: 20, // 15 / 75 * 100
                },
            },
            interpretAs: 'less-is-better',
            metricFormat: 'percent',
            hint: {
                title: 'Percentage of recipients who unsubscribed after first replying to the message.',
            },
        })
    })

    it('should return null value when optedOutAfterReply is fetching', () => {
        mockUseAIJourneyOptOutAfterReply.mockReturnValue({
            trend: {
                isFetching: true,
                isError: false,
                data: {
                    label: 'Opted-out after reply',
                    value: null,
                    prevValue: null,
                },
            },
        })

        const { result } = renderHook(() =>
            useAIJourneyOptOutAfterReplyRate({
                integrationId: '123',
                userTimezone: 'UTC',
                filters: mockFilters,
                journeyIds: ['journey-1'],
            }),
        )

        expect(result.current.trend.isFetching).toBe(true)
        expect(result.current.trend.data?.value).toBeNull()
    })

    it('should return null value when totalReplies is fetching', () => {
        mockUseAIJourneyTotalReplies.mockReturnValue({
            trend: {
                isFetching: true,
                isError: false,
                data: {
                    label: 'Recipients who replied',
                    value: null,
                    prevValue: null,
                },
            },
        })

        const { result } = renderHook(() =>
            useAIJourneyOptOutAfterReplyRate({
                integrationId: '123',
                userTimezone: 'UTC',
                filters: mockFilters,
                journeyIds: ['journey-1'],
            }),
        )

        expect(result.current.trend.isFetching).toBe(true)
        expect(result.current.trend.data?.value).toBeNull()
    })

    it('should return 0 as prevValue when prevValues are null', () => {
        mockUseAIJourneyOptOutAfterReply.mockReturnValue({
            trend: {
                isFetching: false,
                isError: false,
                data: {
                    label: 'Opted-out after reply',
                    value: 30,
                    prevValue: null,
                },
            },
        })
        mockUseAIJourneyTotalReplies.mockReturnValue({
            trend: {
                isFetching: false,
                isError: false,
                data: {
                    label: 'Recipients who replied',
                    value: 100,
                    prevValue: null,
                },
            },
        })

        const { result } = renderHook(() =>
            useAIJourneyOptOutAfterReplyRate({
                integrationId: '123',
                userTimezone: 'UTC',
                filters: mockFilters,
            }),
        )

        expect(result.current.trend.data?.prevValue).toBe(0)
    })

    it('should forward journeyIds to both sub-hooks', () => {
        const journeyIds = ['journey-1', 'journey-2']

        renderHook(() =>
            useAIJourneyOptOutAfterReplyRate({
                integrationId: '123',
                userTimezone: 'UTC',
                filters: mockFilters,
                journeyIds,
            }),
        )

        expect(mockUseAIJourneyOptOutAfterReply).toHaveBeenCalledWith(
            expect.objectContaining({
                integrationId: '123',
                journeyIds,
                forceEmpty: false,
            }),
        )
        expect(mockUseAIJourneyTotalReplies).toHaveBeenCalledWith(
            expect.objectContaining({
                integrationId: '123',
                journeyIds,
                forceEmpty: false,
            }),
        )
    })

    it('should disable all sub-hooks when no flows or campaigns are selected', () => {
        renderHook(() =>
            useAIJourneyOptOutAfterReplyRate({
                integrationId: '123',
                userTimezone: 'UTC',
                filters: mockFilters,
                journeyIds: ['journey-1'],
                forceEmpty: true,
            }),
        )

        expect(mockUseAIJourneyOptOutAfterReply).toHaveBeenCalledWith(
            expect.objectContaining({ forceEmpty: true }),
        )
        expect(mockUseAIJourneyTotalReplies).toHaveBeenCalledWith(
            expect.objectContaining({ forceEmpty: true }),
        )
    })
})
