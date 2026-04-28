import { renderHook } from '@repo/testing'

import { JOURNEY_COMPLETE_REASON } from 'AIJourney/constants'
import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import { aiJourneyRepliedMessagesQueryFactory } from 'AIJourney/utils/analytics-factories/factories'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AiSalesAgentConversationsDimension,
    AiSalesAgentConversationsMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'

import { useAIJourneyTotalReplies } from './useAIJourneyTotalReplies'

jest.mock('domains/reporting/hooks/useMetricPerDimension')
jest.mock('AIJourney/utils/analytics-factories/factories')

describe('useAIJourneyTotalReplies', () => {
    const integrationId = '123'
    const userTimezone = 'America/New_York'
    const filters = {
        period: {
            start_datetime: '2025-08-07T00:00:00.000Z',
            end_datetime: '2025-09-04T23:59:59.999Z',
        },
    }

    const makeRow = (
        replyCount: string,
        journeyCompleteReason: string,
        count: string,
    ) => ({
        [AiSalesAgentConversationsDimension.ReplyCount]: replyCount,
        [AiSalesAgentConversationsDimension.JourneyCompleteReason]:
            journeyCompleteReason,
        [AiSalesAgentConversationsMeasure.Count]: count,
    })

    beforeEach(() => {
        ;(useMetricPerDimension as jest.Mock).mockReturnValue({
            data: { allData: [] },
            isFetching: false,
            isError: false,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderMetrics = (
        overrides?: Partial<Parameters<typeof useAIJourneyTotalReplies>[0]>,
    ) =>
        renderHook(() =>
            useAIJourneyTotalReplies({
                integrationId,
                userTimezone,
                filters,
                journeyIds: ['journey-1'],
                ...overrides,
            }),
        )

    it('should return metric data with correct shape when loaded', () => {
        ;(useMetricPerDimension as jest.Mock)
            .mockReturnValueOnce({
                data: { allData: [makeRow('2', 'other', '300')] },
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: { allData: [makeRow('2', 'other', '250')] },
                isFetching: false,
                isError: false,
            })

        const { result } = renderMetrics()

        expect(result.current).toEqual({
            drilldownMetricName: AIJourneyMetric.TotalReplies,
            trend: {
                isFetching: false,
                isError: false,
                data: {
                    label: 'Recipients who replied',
                    value: 300,
                    prevValue: 250,
                },
            },
            interpretAs: 'more-is-better',
            metricFormat: 'decimal',
            hint: {
                title: 'The number of recipients who sent a reply to the received message.',
            },
        })
    })

    describe('opted-out exclusion', () => {
        it('should exclude conversations with replyCount === 1 and opted-out reason', () => {
            ;(useMetricPerDimension as jest.Mock)
                .mockReturnValueOnce({
                    data: {
                        allData: [
                            makeRow('2', 'other', '100'),
                            makeRow(
                                '1',
                                JOURNEY_COMPLETE_REASON.OPTED_OUT,
                                '50',
                            ),
                            makeRow(
                                '3',
                                JOURNEY_COMPLETE_REASON.OPTED_OUT,
                                '30',
                            ),
                        ],
                    },
                    isFetching: false,
                    isError: false,
                })
                .mockReturnValueOnce({
                    data: { allData: [] },
                    isFetching: false,
                    isError: false,
                })

            const { result } = renderMetrics()

            expect(result.current.trend.data?.value).toBe(130)
        })

        it('should not exclude conversations with replyCount > 1 even with opted-out reason', () => {
            ;(useMetricPerDimension as jest.Mock)
                .mockReturnValueOnce({
                    data: {
                        allData: [
                            makeRow(
                                '2',
                                JOURNEY_COMPLETE_REASON.OPTED_OUT,
                                '80',
                            ),
                            makeRow(
                                '1',
                                JOURNEY_COMPLETE_REASON.OPTED_OUT,
                                '20',
                            ),
                        ],
                    },
                    isFetching: false,
                    isError: false,
                })
                .mockReturnValueOnce({
                    data: { allData: [] },
                    isFetching: false,
                    isError: false,
                })

            const { result } = renderMetrics()

            expect(result.current.trend.data?.value).toBe(80)
        })

        it('should also apply exclusion to the previous period', () => {
            ;(useMetricPerDimension as jest.Mock)
                .mockReturnValueOnce({
                    data: { allData: [makeRow('2', 'other', '100')] },
                    isFetching: false,
                    isError: false,
                })
                .mockReturnValueOnce({
                    data: {
                        allData: [
                            makeRow('2', 'other', '80'),
                            makeRow(
                                '1',
                                JOURNEY_COMPLETE_REASON.OPTED_OUT,
                                '40',
                            ),
                        ],
                    },
                    isFetching: false,
                    isError: false,
                })

            const { result } = renderMetrics()

            expect(result.current.trend.data?.value).toBe(100)
            expect(result.current.trend.data?.prevValue).toBe(80)
        })
    })

    it('should call the factory with current and previous period', () => {
        const journeyIds = ['journey-1']

        renderMetrics({ journeyIds })

        expect(aiJourneyRepliedMessagesQueryFactory).toHaveBeenCalledWith(
            integrationId,
            expect.objectContaining({
                period: expect.objectContaining({
                    start_datetime: expect.any(String),
                    end_datetime: expect.any(String),
                }),
            }),
            userTimezone,
            journeyIds,
        )
        expect(aiJourneyRepliedMessagesQueryFactory).toHaveBeenCalledTimes(2)
    })

    it('should return null value when loading', () => {
        ;(useMetricPerDimension as jest.Mock).mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const { result } = renderMetrics()

        expect(result.current.trend.isFetching).toBe(true)
        expect(result.current.trend.data?.value).toBeNull()
        expect(result.current.trend.data?.prevValue).toBeNull()
    })

    it('should handle undefined journeyIds', () => {
        ;(useMetricPerDimension as jest.Mock)
            .mockReturnValueOnce({
                data: { allData: [makeRow('2', 'other', '300')] },
                isFetching: false,
                isError: false,
            })
            .mockReturnValueOnce({
                data: { allData: [makeRow('2', 'other', '250')] },
                isFetching: false,
                isError: false,
            })

        const { result } = renderMetrics({ journeyIds: undefined })

        expect(aiJourneyRepliedMessagesQueryFactory).toHaveBeenCalledWith(
            integrationId,
            expect.any(Object),
            userTimezone,
            undefined,
        )
        expect(result.current.trend.data?.value).toBe(300)
        expect(result.current.trend.data?.prevValue).toBe(250)
    })

    describe('forceEmpty', () => {
        it('should disable queries and return zeroed values when forceEmpty is true', () => {
            const { result } = renderMetrics({ forceEmpty: true })

            const calls = (useMetricPerDimension as jest.Mock).mock.calls
            calls.forEach((call) => {
                expect(call[2]).toBe(false)
            })

            expect(result.current.trend.isFetching).toBe(false)
            expect(result.current.trend.data?.value).toBe(0)
            expect(result.current.trend.data?.prevValue).toBe(0)
        })

        it('should enable queries when forceEmpty is false', () => {
            renderMetrics({ forceEmpty: false })

            const calls = (useMetricPerDimension as jest.Mock).mock.calls
            calls.forEach((call) => {
                expect(call[2]).toBe(true)
            })
        })
    })
})
