import { assumeMock, renderHook } from '@repo/testing'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { revenuePerInteractionQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    fetchGenericTrend,
    useGenericTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import {
    fetchRevenuePerInteractionMetric,
    useRevenuePerInteractionMetric,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useRevenuePerInteractionMetric'

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend',
)
jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend',
)
jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend',
)
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')

const mockUseAutomateFilters = assumeMock(useAutomateFilters)
const mockUseStatsFilters = assumeMock(useStatsFilters)
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)
const mockUseGenericTrend = assumeMock(useGenericTrend)
const mockFetchGenericTrend = assumeMock(fetchGenericTrend)
const mockUseGmvInfluencedTrend = assumeMock(useGmvInfluencedTrend)
const mockUseTotalNumberOfSalesConversationsTrend = assumeMock(
    useTotalNumberOfSalesConversationsTrend,
)
const mockFetchGmvInfluencedTrend = assumeMock(fetchGmvInfluencedTrend)
const mockFetchTotalNumberOfSalesConversationsTrend = assumeMock(
    fetchTotalNumberOfSalesConversationsTrend,
)
const mockGetNewStatsFeatureFlagMigration = assumeMock(
    getNewStatsFeatureFlagMigration,
)
const mockUseGetNewStatsFeatureFlagMigration = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:59:59.000',
    },
}
const v2StatsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-02-01T00:00:00.000',
        end_datetime: '2024-02-29T23:59:59.000',
    },
}
const timezone = 'UTC'

const trendData = {
    data: { value: 12.5, prevValue: 10.0 },
    isFetching: false,
    isError: false,
}

describe('useRevenuePerInteractionMetric', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAutomateFilters.mockReturnValue({
            statsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
        })
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: v2StatsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
        })
        mockUseGmvInfluencedTrend.mockReturnValue({
            data: { value: 100, prevValue: 80, currency: 'USD' },
            isFetching: false,
            isError: false,
        })
        mockUseTotalNumberOfSalesConversationsTrend.mockReturnValue({
            data: { value: 8, prevValue: 8 },
            isFetching: false,
            isError: false,
        })
        mockUseGenericTrend.mockReturnValue(trendData)
        mockUseStatsMetricTrend.mockReturnValue(trendData)
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue('off')
    })

    describe('when feature flag is off', () => {
        it('should use the v1 (useGenericTrend) result', () => {
            const { result } = renderHook(() =>
                useRevenuePerInteractionMetric(),
            )

            expect(result.current).toEqual({
                isFetching: false,
                isError: false,
                data: {
                    label: 'Revenue per interaction',
                    value: 12.5,
                    prevValue: 10.0,
                },
            })
        })

        it('should call useGenericTrend with enabled=true', () => {
            renderHook(() => useRevenuePerInteractionMetric())

            expect(mockUseGenericTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Function),
                true,
            )
        })

        it('should call useStatsMetricTrend with enabled=false', () => {
            renderHook(() => useRevenuePerInteractionMetric())

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                false,
            )
        })

        it('should call v1 hooks with useAutomateFilters period-only filters', () => {
            renderHook(() => useRevenuePerInteractionMetric())

            expect(mockUseGmvInfluencedTrend).toHaveBeenCalledWith(
                statsFilters,
                timezone,
            )
            expect(
                mockUseTotalNumberOfSalesConversationsTrend,
            ).toHaveBeenCalledWith(statsFilters, timezone)
        })

        it('should compute the trend value using safeDivide', () => {
            renderHook(() => useRevenuePerInteractionMetric())

            const [[, computeValue]] = mockUseGenericTrend.mock.calls
            expect(
                computeValue({
                    gmvInfluenced: 100,
                    totalNumberOfAgentSalesConverations: 8,
                }),
            ).toBe(12.5)
        })
    })

    describe('when feature flag is live', () => {
        beforeEach(() => {
            mockUseGetNewStatsFeatureFlagMigration.mockReturnValue('live')
        })

        it('should use the v2 (useStatsMetricTrend) result', () => {
            const v2TrendData = {
                data: { value: 15.0, prevValue: 12.0 },
                isFetching: false,
                isError: false,
            }
            mockUseStatsMetricTrend.mockReturnValue(v2TrendData)

            const { result } = renderHook(() =>
                useRevenuePerInteractionMetric(),
            )

            expect(result.current).toEqual({
                isFetching: false,
                isError: false,
                data: {
                    label: 'Revenue per interaction',
                    value: 15.0,
                    prevValue: 12.0,
                },
            })
        })

        it('should call useStatsMetricTrend with v2 factory and enabled=true', () => {
            renderHook(() => useRevenuePerInteractionMetric())

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                revenuePerInteractionQueryV2Factory({
                    filters: v2StatsFilters,
                    timezone,
                }),
                revenuePerInteractionQueryV2Factory({
                    filters: {
                        ...v2StatsFilters,
                        period: getPreviousPeriod(v2StatsFilters.period),
                    },
                    timezone,
                }),
                true,
            )
        })

        it('should call useGetNewStatsFeatureFlagMigration with the correct metric name', () => {
            renderHook(() => useRevenuePerInteractionMetric())

            expect(mockUseGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_REVENUE_PER_INTERACTION,
            )
        })

        it('should return null value and prevValue when data is undefined', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: undefined,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHook(() =>
                useRevenuePerInteractionMetric(),
            )

            expect(result.current.data?.value).toBeNull()
            expect(result.current.data?.prevValue).toBeNull()
        })

        it('should propagate isFetching=true from v2 trend', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: undefined,
                isFetching: true,
                isError: false,
            })

            const { result } = renderHook(() =>
                useRevenuePerInteractionMetric(),
            )

            expect(result.current.isFetching).toBe(true)
        })

        it('should propagate isError=true from v2 trend', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: undefined,
                isFetching: false,
                isError: true,
            })

            const { result } = renderHook(() =>
                useRevenuePerInteractionMetric(),
            )

            expect(result.current.isError).toBe(true)
        })
    })

    describe('when feature flag is complete', () => {
        beforeEach(() => {
            mockUseGetNewStatsFeatureFlagMigration.mockReturnValue('complete')
        })

        it('should use the v2 (useStatsMetricTrend) result', () => {
            const v2TrendData = {
                data: { value: 15.0, prevValue: 12.0 },
                isFetching: false,
                isError: false,
            }
            mockUseStatsMetricTrend.mockReturnValue(v2TrendData)

            const { result } = renderHook(() =>
                useRevenuePerInteractionMetric(),
            )

            expect(result.current).toEqual({
                isFetching: false,
                isError: false,
                data: {
                    label: 'Revenue per interaction',
                    value: 15.0,
                    prevValue: 12.0,
                },
            })
        })

        it('should call useStatsMetricTrend with v2 factory and enabled=true', () => {
            renderHook(() => useRevenuePerInteractionMetric())

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                revenuePerInteractionQueryV2Factory({
                    filters: v2StatsFilters,
                    timezone,
                }),
                revenuePerInteractionQueryV2Factory({
                    filters: {
                        ...v2StatsFilters,
                        period: getPreviousPeriod(v2StatsFilters.period),
                    },
                    timezone,
                }),
                true,
            )
        })
    })
})

describe('fetchRevenuePerInteractionMetric', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockFetchGmvInfluencedTrend.mockResolvedValue({
            data: { value: 12.5, prevValue: 10.0, currency: 'USD' },
            isFetching: false,
            isError: false,
        })
        mockFetchTotalNumberOfSalesConversationsTrend.mockResolvedValue(
            trendData,
        )
        mockFetchGenericTrend.mockResolvedValue(trendData)
        mockFetchStatsMetricTrend.mockResolvedValue(trendData)
        mockGetNewStatsFeatureFlagMigration.mockResolvedValue('off')
    })

    describe('when feature flag is off', () => {
        it('should call fetchGenericTrend with v1 factories', async () => {
            await fetchRevenuePerInteractionMetric(statsFilters, timezone)

            expect(mockFetchGenericTrend).toHaveBeenCalledWith(
                expect.objectContaining({
                    gmvInfluenced: expect.anything(),
                    totalNumberOfAgentSalesConverations: expect.anything(),
                }),
                expect.any(Function),
            )
            expect(mockFetchStatsMetricTrend).not.toHaveBeenCalled()
        })

        it('should compute the trend value using safeDivide', async () => {
            await fetchRevenuePerInteractionMetric(statsFilters, timezone)

            const [[, computeValue]] = mockFetchGenericTrend.mock.calls
            expect(
                computeValue({
                    gmvInfluenced: 100,
                    totalNumberOfAgentSalesConverations: 8,
                }),
            ).toBe(12.5)
        })
    })

    describe('when feature flag is live', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('live')
        })

        it('should call fetchStatsMetricTrend with v2 factories', async () => {
            await fetchRevenuePerInteractionMetric(statsFilters, timezone)

            expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
                revenuePerInteractionQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                revenuePerInteractionQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
            expect(mockFetchGenericTrend).not.toHaveBeenCalled()
        })

        it('should call getNewStatsFeatureFlagMigration with the correct metric name', async () => {
            await fetchRevenuePerInteractionMetric(statsFilters, timezone)

            expect(mockGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
                METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_REVENUE_PER_INTERACTION,
            )
        })
    })

    describe('when feature flag is complete', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('complete')
        })

        it('should call fetchStatsMetricTrend with v2 factories', async () => {
            await fetchRevenuePerInteractionMetric(statsFilters, timezone)

            expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
                revenuePerInteractionQueryV2Factory({
                    filters: statsFilters,
                    timezone,
                }),
                revenuePerInteractionQueryV2Factory({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
            expect(mockFetchGenericTrend).not.toHaveBeenCalled()
        })
    })
})
