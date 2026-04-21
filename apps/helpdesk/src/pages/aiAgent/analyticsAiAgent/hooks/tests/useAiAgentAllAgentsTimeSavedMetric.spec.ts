import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchAiAgentTimeSavedByAgentsTrend,
    useAiAgentTimeSavedByAgentsTrend,
} from 'domains/reporting/hooks/automate/useAiAgentTimeSavedByAgentsTrend'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicAllAgentsTimeSavedQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import {
    fetchAiAgentAllAgentsTimeSavedTrend,
    useAiAgentAllAgentsTimeSavedMetric,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTimeSavedMetric'

jest.mock('domains/reporting/hooks/automate/useAiAgentTimeSavedByAgentsTrend')
jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')

const mockUseAiAgentTimeSavedByAgentsTrend = assumeMock(
    useAiAgentTimeSavedByAgentsTrend,
)
const mockFetchAiAgentTimeSavedByAgentsTrend = assumeMock(
    fetchAiAgentTimeSavedByAgentsTrend,
)
const mockUseAutomateFilters = assumeMock(useAutomateFilters)
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)
const mockGetNewStatsFeatureFlagMigration = assumeMock(
    getNewStatsFeatureFlagMigration,
)
const mockUseGetNewStatsFeatureFlagMigration = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:59:59.999',
    },
}
const timezone = 'UTC'

const mockV1Trend = {
    isFetching: false,
    isError: false,
    data: { value: 19800, prevValue: 18000 },
}

const mockV2Trend = {
    isFetching: false,
    isError: false,
    data: { value: 21600, prevValue: 19800 },
}

describe('useAiAgentAllAgentsTimeSavedMetric', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAutomateFilters.mockReturnValue({
            statsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
        })
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
            stage: 'off',
            isLoading: false,
        })
        mockUseAiAgentTimeSavedByAgentsTrend.mockReturnValue(mockV1Trend)
        mockUseStatsMetricTrend.mockReturnValue(mockV2Trend)
    })

    it('should call useGetNewStatsFeatureFlagMigration with the correct metric name', () => {
        renderHook(() => useAiAgentAllAgentsTimeSavedMetric())

        expect(mockUseGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_TIME_SAVED_BY_AGENT,
        )
    })

    describe('when feature flag is off', () => {
        it('should return data from v1 trend with label', () => {
            const { result } = renderHook(() =>
                useAiAgentAllAgentsTimeSavedMetric(),
            )

            expect(result.current).toEqual({
                isFetching: false,
                isError: false,
                data: {
                    label: 'Time saved by agents',
                    value: 19800,
                    prevValue: 18000,
                },
            })
        })

        it('should return null values when data is undefined', () => {
            mockUseAiAgentTimeSavedByAgentsTrend.mockReturnValue({
                isFetching: false,
                isError: false,
                data: undefined,
            } as unknown as ReturnType<typeof useAiAgentTimeSavedByAgentsTrend>)

            const { result } = renderHook(() =>
                useAiAgentAllAgentsTimeSavedMetric(),
            )

            expect(result.current).toEqual({
                isFetching: false,
                isError: false,
                data: {
                    label: 'Time saved by agents',
                    value: null,
                    prevValue: null,
                },
            })
        })

        it('should call useStatsMetricTrend with enabled=false', () => {
            renderHook(() => useAiAgentAllAgentsTimeSavedMetric())

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                false,
            )
        })

        it('should call useAiAgentTimeSavedByAgentsTrend with enabled=true', () => {
            renderHook(() => useAiAgentAllAgentsTimeSavedMetric())

            expect(mockUseAiAgentTimeSavedByAgentsTrend).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                true,
            )
        })
    })

    describe('when feature flag is live', () => {
        beforeEach(() => {
            mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
                stage: 'live',
                isLoading: false,
            })
        })

        it('should return data from v2 trend with label', () => {
            const { result } = renderHook(() =>
                useAiAgentAllAgentsTimeSavedMetric(),
            )

            expect(result.current).toEqual({
                isFetching: false,
                isError: false,
                data: {
                    label: 'Time saved by agents',
                    value: 21600,
                    prevValue: 19800,
                },
            })
        })

        it('should call useStatsMetricTrend with current and previous period queries and enabled=true', () => {
            renderHook(() => useAiAgentAllAgentsTimeSavedMetric())

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                dynamicAllAgentsTimeSavedQueryFactoryV2({
                    filters: statsFilters,
                    timezone,
                }),
                dynamicAllAgentsTimeSavedQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
                true,
            )
        })

        it('should call useAiAgentTimeSavedByAgentsTrend with enabled=false', () => {
            renderHook(() => useAiAgentAllAgentsTimeSavedMetric())

            expect(mockUseAiAgentTimeSavedByAgentsTrend).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                false,
            )
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
            renderHook(() => useAiAgentAllAgentsTimeSavedMetric())

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                true,
            )
        })
    })

    describe('when feature flag is loading', () => {
        beforeEach(() => {
            mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
                stage: 'off',
                isLoading: true,
            })
        })

        it('should return isFetching=true', () => {
            const { result } = renderHook(() =>
                useAiAgentAllAgentsTimeSavedMetric(),
            )

            expect(result.current.isFetching).toBe(true)
        })

        it('should call both queries with enabled=false', () => {
            renderHook(() => useAiAgentAllAgentsTimeSavedMetric())

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                false,
            )
            expect(mockUseAiAgentTimeSavedByAgentsTrend).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                false,
            )
        })
    })
})

describe('fetchAiAgentAllAgentsTimeSavedTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockGetNewStatsFeatureFlagMigration.mockResolvedValue('off')
        mockFetchAiAgentTimeSavedByAgentsTrend.mockResolvedValue(mockV1Trend)
        mockFetchStatsMetricTrend.mockResolvedValue(mockV2Trend)
    })

    it('should call getNewStatsFeatureFlagMigration with the correct metric name', async () => {
        await fetchAiAgentAllAgentsTimeSavedTrend(statsFilters, timezone)

        expect(mockGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_TIME_SAVED_BY_AGENT,
        )
    })

    describe('when feature flag is off', () => {
        it('should call fetchAiAgentTimeSavedByAgentsTrend and return its result', async () => {
            const result = await fetchAiAgentAllAgentsTimeSavedTrend(
                statsFilters,
                timezone,
            )

            expect(mockFetchAiAgentTimeSavedByAgentsTrend).toHaveBeenCalledWith(
                statsFilters,
                timezone,
            )
            expect(mockFetchStatsMetricTrend).not.toHaveBeenCalled()
            expect(result).toEqual(mockV1Trend)
        })
    })

    describe('when feature flag is live', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('live')
        })

        it('should call fetchStatsMetricTrend with current and previous period queries', async () => {
            await fetchAiAgentAllAgentsTimeSavedTrend(statsFilters, timezone)

            expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
                dynamicAllAgentsTimeSavedQueryFactoryV2({
                    filters: statsFilters,
                    timezone,
                }),
                dynamicAllAgentsTimeSavedQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
            expect(
                mockFetchAiAgentTimeSavedByAgentsTrend,
            ).not.toHaveBeenCalled()
        })

        it('should return the result from fetchStatsMetricTrend', async () => {
            const result = await fetchAiAgentAllAgentsTimeSavedTrend(
                statsFilters,
                timezone,
            )

            expect(result).toEqual(mockV2Trend)
        })
    })

    describe('when feature flag is complete', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('complete')
        })

        it('should call fetchStatsMetricTrend and not fetchAiAgentTimeSavedByAgentsTrend', async () => {
            await fetchAiAgentAllAgentsTimeSavedTrend(statsFilters, timezone)

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(
                mockFetchAiAgentTimeSavedByAgentsTrend,
            ).not.toHaveBeenCalled()
        })
    })
})
