import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchTimeSavedByAgentsTrend,
    useTimeSavedByAgentsTrend,
} from 'domains/reporting/hooks/automate/useTimeSavedByAgentsTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicAverageTimeSavedByAgentQueryFactoryV2 } from 'domains/reporting/models/scopes/overallTimeSavedByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import {
    fetchOverallTimeSavedByAgentsTrend,
    useOverallTimeSavedByAgentsTrend,
} from 'pages/aiAgent/analyticsOverview/hooks/useOverallTimeSavedByAgentsTrend'

jest.mock('domains/reporting/hooks/automate/useTimeSavedByAgentsTrend')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')

const mockUseTimeSavedByAgentsTrend = assumeMock(useTimeSavedByAgentsTrend)
const mockFetchTimeSavedByAgentsTrend = assumeMock(fetchTimeSavedByAgentsTrend)
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)
const mockGetNewStatsFeatureFlagMigration = assumeMock(
    getNewStatsFeatureFlagMigration,
)
const mockUseGetNewStatsFeatureFlagMigration = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)

const mockFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
} as StatsFilters

const timezone = 'UTC'

const mockV1Trend = {
    isFetching: false,
    isError: false,
    data: { value: 100, prevValue: 80 },
}

const mockV2Trend = {
    isFetching: false,
    isError: false,
    data: { value: 120, prevValue: 95 },
}

describe('useOverallTimeSavedByAgentsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
            stage: 'off',
            isLoading: false,
        })
        mockUseTimeSavedByAgentsTrend.mockReturnValue(mockV1Trend)
        mockUseStatsMetricTrend.mockReturnValue(mockV2Trend)
    })

    const renderTimeSavedTrendHook = () =>
        renderHook(() =>
            useOverallTimeSavedByAgentsTrend(mockFilters, timezone),
        )

    it('should call useGetNewStatsFeatureFlagMigration with the correct metric name', () => {
        renderTimeSavedTrendHook()

        expect(mockUseGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_AVERAGE_TIME_SAVED_BY_AGENT,
        )
    })

    describe('when feature flag is off', () => {
        it('should call useStatsMetricTrend with enabled=false', () => {
            renderTimeSavedTrendHook()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                false,
            )
        })

        it('should return v1 trend data', () => {
            const { result } = renderTimeSavedTrendHook()

            expect(result.current).toBe(mockV1Trend)
        })
    })

    describe('when feature flag is live', () => {
        beforeEach(() => {
            mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
                stage: 'live',
                isLoading: false,
            })
        })

        it('should call useStatsMetricTrend with current and previous period queries', () => {
            renderTimeSavedTrendHook()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                dynamicAverageTimeSavedByAgentQueryFactoryV2({
                    filters: mockFilters,
                    timezone,
                }),
                dynamicAverageTimeSavedByAgentQueryFactoryV2({
                    filters: {
                        ...mockFilters,
                        period: getPreviousPeriod(mockFilters.period),
                    },
                    timezone,
                }),
                true,
            )
        })

        it('should return v2 trend data', () => {
            const { result } = renderTimeSavedTrendHook()

            expect(result.current).toBe(mockV2Trend)
        })
    })

    describe('when feature flag is complete', () => {
        beforeEach(() => {
            mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
                stage: 'complete',
                isLoading: false,
            })
        })

        it('should call useStatsMetricTrend with enabled=true', () => {
            renderTimeSavedTrendHook()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                true,
            )
        })

        it('should return v2 trend data', () => {
            const { result } = renderTimeSavedTrendHook()

            expect(result.current).toBe(mockV2Trend)
        })
    })

    it('should propagate isFetching=true from v1 trend', () => {
        mockUseTimeSavedByAgentsTrend.mockReturnValue({
            ...mockV1Trend,
            isFetching: true,
        })

        const { result } = renderTimeSavedTrendHook()

        expect(result.current.isFetching).toBe(true)
    })

    it('should propagate isError=true from v1 trend', () => {
        mockUseTimeSavedByAgentsTrend.mockReturnValue({
            ...mockV1Trend,
            isError: true,
        })

        const { result } = renderTimeSavedTrendHook()

        expect(result.current.isError).toBe(true)
    })

    it('should propagate isFetching=true from v2 trend', () => {
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
            stage: 'live',
            isLoading: false,
        })
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockV2Trend,
            isFetching: true,
        })

        const { result } = renderTimeSavedTrendHook()

        expect(result.current.isFetching).toBe(true)
    })

    it('should propagate isError=true from v2 trend', () => {
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
            stage: 'live',
            isLoading: false,
        })
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockV2Trend,
            isError: true,
        })

        const { result } = renderTimeSavedTrendHook()

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchOverallTimeSavedByAgentsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockGetNewStatsFeatureFlagMigration.mockResolvedValue('off')
        mockFetchTimeSavedByAgentsTrend.mockResolvedValue(mockV1Trend)
        mockFetchStatsMetricTrend.mockResolvedValue(mockV2Trend)
    })

    it('should call getNewStatsFeatureFlagMigration with the correct metric name', async () => {
        await fetchOverallTimeSavedByAgentsTrend(mockFilters, timezone)

        expect(mockGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_AVERAGE_TIME_SAVED_BY_AGENT,
        )
    })

    describe('when feature flag is off', () => {
        it('should call fetchTimeSavedByAgentsTrend and not fetchStatsMetricTrend', async () => {
            await fetchOverallTimeSavedByAgentsTrend(mockFilters, timezone)

            expect(mockFetchTimeSavedByAgentsTrend).toHaveBeenCalledWith(
                mockFilters,
                timezone,
            )
            expect(mockFetchStatsMetricTrend).not.toHaveBeenCalled()
        })

        it('should return v1 trend data', async () => {
            const result = await fetchOverallTimeSavedByAgentsTrend(
                mockFilters,
                timezone,
            )

            expect(result).toBe(mockV1Trend)
        })
    })

    describe('when feature flag is live', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('live')
        })

        it('should call fetchStatsMetricTrend with current and previous period queries', async () => {
            await fetchOverallTimeSavedByAgentsTrend(mockFilters, timezone)

            expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
                dynamicAverageTimeSavedByAgentQueryFactoryV2({
                    filters: mockFilters,
                    timezone,
                }),
                dynamicAverageTimeSavedByAgentQueryFactoryV2({
                    filters: {
                        ...mockFilters,
                        period: getPreviousPeriod(mockFilters.period),
                    },
                    timezone,
                }),
            )
            expect(mockFetchTimeSavedByAgentsTrend).not.toHaveBeenCalled()
        })

        it('should return v2 trend data', async () => {
            const result = await fetchOverallTimeSavedByAgentsTrend(
                mockFilters,
                timezone,
            )

            expect(result).toBe(mockV2Trend)
        })
    })

    describe('when feature flag is complete', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('complete')
        })

        it('should call fetchStatsMetricTrend and not fetchTimeSavedByAgentsTrend', async () => {
            await fetchOverallTimeSavedByAgentsTrend(mockFilters, timezone)

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(mockFetchTimeSavedByAgentsTrend).not.toHaveBeenCalled()
        })
    })
})
