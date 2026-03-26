import { renderHook } from '@testing-library/react'

import { AIJourneyMetric } from 'AIJourney/types/AIJourneyTypes'
import useMetricTrend from 'domains/reporting/hooks/useMetricTrend'
import { AiSalesAgentConversationsMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'

import { useAIJourneyDiscountCodeUsageMetrics } from './useAIJourneyDiscountCodeUsageMetrics'

jest.mock('domains/reporting/hooks/useMetricTrend')

describe('useAIJourneyDiscountCodeUsageMetrics', () => {
    const mockIntegrationId = '123'
    const mockUserTimezone = 'America/New_York'
    const mockFilters = {
        period: {
            start_datetime: '2025-07-03T00:00:00Z',
            end_datetime: '2025-07-31T23:59:59Z',
        },
    }
    const mockJourneyIds = ['journey-1', 'journey-2']

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderMetrics = (overrides?: {
        journeyIds?: string[]
        forceEmpty?: boolean
    }) =>
        renderHook(() =>
            useAIJourneyDiscountCodeUsageMetrics({
                integrationId: mockIntegrationId,
                userTimezone: mockUserTimezone,
                filters: mockFilters,
                journeyIds: mockJourneyIds,
                ...overrides,
            }),
        )

    describe('offered metric', () => {
        it('should return correct shape and values', () => {
            ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
                if (
                    args.measures[0] === AiSalesAgentConversationsMeasure.Count
                ) {
                    return {
                        data: { value: 100, prevValue: 80 },
                        isFetching: false,
                    }
                }
                return { data: { value: 40, prevValue: 20 }, isFetching: false }
            })

            const { result } = renderMetrics()
            const [offered] = result.current

            expect(offered).toEqual({
                trend: {
                    isFetching: false,
                    isError: false,
                    data: {
                        label: 'Discount codes generated',
                        value: 100,
                        prevValue: 80,
                    },
                },
                interpretAs: 'more-is-better',
                metricFormat: 'decimal',
                hint: {
                    title: 'The total number of unique discount codes generated during selected date range.',
                },
                drilldownMetricName: AIJourneyMetric.DiscountCodesGenerated,
            })
        })
    })

    describe('used metric', () => {
        it('should return correct shape and values', () => {
            ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
                if (
                    args.measures[0] === AiSalesAgentConversationsMeasure.Count
                ) {
                    return {
                        data: { value: 100, prevValue: 80 },
                        isFetching: false,
                    }
                }
                if (args.measures[0] === AiSalesAgentOrdersMeasure.Count) {
                    return {
                        data: { value: 40, prevValue: 20 },
                        isFetching: false,
                    }
                }
            })

            const { result } = renderMetrics()
            const [, used] = result.current

            expect(used).toEqual({
                trend: {
                    isFetching: false,
                    isError: false,
                    data: {
                        label: 'Discount codes used',
                        value: 40,
                        prevValue: 20,
                    },
                },
                interpretAs: 'more-is-better',
                metricFormat: 'decimal',
                hint: {
                    title: 'The number of discount codes that were redeemed by recipients.',
                },
                drilldownMetricName: AIJourneyMetric.DiscountCodesUsed,
            })
        })
    })

    describe('rate metric', () => {
        it('should return rate as percentage (0-100) not ratio (0-1)', () => {
            ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
                if (
                    args.measures[0] === AiSalesAgentConversationsMeasure.Count
                ) {
                    return {
                        data: { value: 100, prevValue: 80 },
                        isFetching: false,
                    }
                }
                return { data: { value: 40, prevValue: 20 }, isFetching: false }
            })

            const { result } = renderMetrics()
            const [, , rate] = result.current

            expect(rate).toEqual({
                trend: {
                    isFetching: false,
                    isError: false,
                    data: {
                        label: 'Discount code usage rate',
                        value: 40,
                        prevValue: 25,
                    },
                },
                interpretAs: 'more-is-better',
                metricFormat: 'percent',
                hint: {
                    title: 'The percentage of generated discount codes that were redeemed. Calculated as codes used divided by codes generated * 100.',
                },
            })
        })

        it('should return 0 rate when offered count is 0', () => {
            ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
                if (
                    args.measures[0] === AiSalesAgentConversationsMeasure.Count
                ) {
                    return {
                        data: { value: 0, prevValue: 0 },
                        isFetching: false,
                    }
                }
                return { data: { value: 40, prevValue: 20 }, isFetching: false }
            })

            const { result } = renderMetrics()
            const [, , rate] = result.current

            expect(rate.trend.isFetching).toBe(false)
            expect(rate.trend.data?.value).toBe(0)
            expect(rate.trend.data?.prevValue).toBe(0)
        })

        it('should show null values and isFetching when offered metric is fetching', () => {
            ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
                if (
                    args.measures[0] === AiSalesAgentConversationsMeasure.Count
                ) {
                    return { data: undefined, isFetching: true }
                }
                return { data: { value: 40, prevValue: 20 }, isFetching: false }
            })

            const { result } = renderMetrics()
            const [offered, , rate] = result.current

            expect(offered.trend.isFetching).toBe(true)
            expect(rate.trend.isFetching).toBe(true)
            expect(rate.trend.data?.value).toBeNull()
            expect(rate.trend.data?.prevValue).toBeNull()
        })

        it('should show null values and isFetching when used metric is fetching', () => {
            ;(useMetricTrend as jest.Mock).mockImplementation((args) => {
                if (args.measures[0] === AiSalesAgentOrdersMeasure.Count) {
                    return { data: undefined, isFetching: true }
                }
                return {
                    data: { value: 100, prevValue: 80 },
                    isFetching: false,
                }
            })

            const { result } = renderMetrics()
            const [, used, rate] = result.current

            expect(used.trend.isFetching).toBe(true)
            expect(rate.trend.isFetching).toBe(true)
            expect(rate.trend.data?.value).toBeNull()
            expect(rate.trend.data?.prevValue).toBeNull()
        })

        it('should return 0 rate when useMetricTrend returns null data', () => {
            ;(useMetricTrend as jest.Mock).mockReturnValue({
                data: null,
                isFetching: false,
            })

            const { result } = renderMetrics()
            const [offered, used, rate] = result.current

            expect(offered.trend.data?.value).toBeNull()
            expect(used.trend.data?.value).toBeNull()
            expect(rate.trend.isFetching).toBe(false)
            expect(rate.trend.data?.value).toBe(0)
        })
    })

    describe('forceEmpty', () => {
        it('should disable sub-hooks and return zeroed values', () => {
            ;(useMetricTrend as jest.Mock).mockReturnValue({
                data: undefined,
                isFetching: false,
            })

            const { result } = renderMetrics({ forceEmpty: true })

            const calls = (useMetricTrend as jest.Mock).mock.calls
            calls.forEach((call) => {
                expect(call[4]).toBe(false)
            })

            const [offered, used] = result.current
            expect(offered.trend.isFetching).toBe(false)
            expect(offered.trend.data?.value).toBe(0)
            expect(offered.trend.data?.prevValue).toBe(0)
            expect(used.trend.isFetching).toBe(false)
            expect(used.trend.data?.value).toBe(0)
            expect(used.trend.data?.prevValue).toBe(0)
        })

        it('should enable sub-hooks when forceEmpty is false', () => {
            ;(useMetricTrend as jest.Mock).mockReturnValue({
                data: { value: 10, prevValue: 5 },
                isFetching: false,
            })

            renderMetrics({ forceEmpty: false })

            const calls = (useMetricTrend as jest.Mock).mock.calls
            calls.forEach((call) => {
                expect(call[4]).toBe(true)
            })
        })
    })
})
