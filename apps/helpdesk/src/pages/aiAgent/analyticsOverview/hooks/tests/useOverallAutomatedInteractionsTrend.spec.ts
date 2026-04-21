import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchFilteredAutomatedInteractions,
    useFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicOverallAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import {
    fetchOverallAutomatedInteractionsTrend,
    useOverallAutomatedInteractionsTrend,
} from 'pages/aiAgent/analyticsOverview/hooks/useOverallAutomatedInteractionsTrend'

jest.mock('domains/reporting/hooks/automate/automationTrends')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')

const mockUseFilteredAutomatedInteractions = assumeMock(
    useFilteredAutomatedInteractions,
)
const mockFetchFilteredAutomatedInteractions = assumeMock(
    fetchFilteredAutomatedInteractions,
)
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

describe('useOverallAutomatedInteractionsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
            stage: 'off',
            isLoading: false,
        })
        mockUseFilteredAutomatedInteractions.mockReturnValue(mockV1Trend)
        mockUseStatsMetricTrend.mockReturnValue(mockV2Trend)
    })

    const renderAutomatedInteractionsTrendHook = (enabled?: boolean) =>
        renderHook(() =>
            useOverallAutomatedInteractionsTrend(
                mockFilters,
                timezone,
                enabled,
            ),
        )

    it('should call useGetNewStatsFeatureFlagMigration with the correct metric name', () => {
        renderAutomatedInteractionsTrendHook()

        expect(mockUseGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_OVERALL_AUTOMATED_INTERACTIONS,
        )
    })

    describe('when feature flag is off', () => {
        it('should call useFilteredAutomatedInteractions with enabled=true by default', () => {
            renderAutomatedInteractionsTrendHook()

            expect(mockUseFilteredAutomatedInteractions).toHaveBeenCalledWith(
                mockFilters,
                timezone,
                true,
            )
        })

        it('should call useFilteredAutomatedInteractions with enabled=false when disabled', () => {
            renderAutomatedInteractionsTrendHook(false)

            expect(mockUseFilteredAutomatedInteractions).toHaveBeenCalledWith(
                mockFilters,
                timezone,
                false,
            )
        })

        it('should call useStatsMetricTrend with enabled=false', () => {
            renderAutomatedInteractionsTrendHook()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                false,
            )
        })

        it('should return v1 trend data', () => {
            const { result } = renderAutomatedInteractionsTrendHook()

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

        it('should call useFilteredAutomatedInteractions with enabled=false', () => {
            renderAutomatedInteractionsTrendHook()

            expect(mockUseFilteredAutomatedInteractions).toHaveBeenCalledWith(
                mockFilters,
                timezone,
                false,
            )
        })

        it('should call useStatsMetricTrend with current and previous period queries and enabled=true', () => {
            renderAutomatedInteractionsTrendHook()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                dynamicOverallAutomatedInteractionsQueryFactoryV2({
                    filters: mockFilters,
                    timezone,
                }),
                dynamicOverallAutomatedInteractionsQueryFactoryV2({
                    filters: {
                        ...mockFilters,
                        period: getPreviousPeriod(mockFilters.period),
                    },
                    timezone,
                }),
                true,
            )
        })

        it('should call useStatsMetricTrend with enabled=false when disabled', () => {
            renderAutomatedInteractionsTrendHook(false)

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                false,
            )
        })

        it('should return v2 trend data', () => {
            const { result } = renderAutomatedInteractionsTrendHook()

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
            renderAutomatedInteractionsTrendHook()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                true,
            )
        })

        it('should call useFilteredAutomatedInteractions with enabled=false', () => {
            renderAutomatedInteractionsTrendHook()

            expect(mockUseFilteredAutomatedInteractions).toHaveBeenCalledWith(
                mockFilters,
                timezone,
                false,
            )
        })

        it('should return v2 trend data', () => {
            const { result } = renderAutomatedInteractionsTrendHook()

            expect(result.current).toBe(mockV2Trend)
        })
    })

    it('should propagate isFetching=true from v1 trend', () => {
        mockUseFilteredAutomatedInteractions.mockReturnValue({
            ...mockV1Trend,
            isFetching: true,
        })

        const { result } = renderAutomatedInteractionsTrendHook()

        expect(result.current.isFetching).toBe(true)
    })

    it('should propagate isError=true from v1 trend', () => {
        mockUseFilteredAutomatedInteractions.mockReturnValue({
            ...mockV1Trend,
            isError: true,
        })

        const { result } = renderAutomatedInteractionsTrendHook()

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

        const { result } = renderAutomatedInteractionsTrendHook()

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

        const { result } = renderAutomatedInteractionsTrendHook()

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchOverallAutomatedInteractionsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockGetNewStatsFeatureFlagMigration.mockResolvedValue('off')
        mockFetchFilteredAutomatedInteractions.mockResolvedValue(mockV1Trend)
        mockFetchStatsMetricTrend.mockResolvedValue(mockV2Trend)
    })

    it('should call getNewStatsFeatureFlagMigration with the correct metric name', async () => {
        await fetchOverallAutomatedInteractionsTrend(mockFilters, timezone)

        expect(mockGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_OVERALL_AUTOMATED_INTERACTIONS,
        )
    })

    describe('when feature flag is off', () => {
        it('should call fetchFilteredAutomatedInteractions and not fetchStatsMetricTrend', async () => {
            await fetchOverallAutomatedInteractionsTrend(mockFilters, timezone)

            expect(mockFetchFilteredAutomatedInteractions).toHaveBeenCalledWith(
                mockFilters,
                timezone,
            )
            expect(mockFetchStatsMetricTrend).not.toHaveBeenCalled()
        })

        it('should return v1 trend data', async () => {
            const result = await fetchOverallAutomatedInteractionsTrend(
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
            await fetchOverallAutomatedInteractionsTrend(mockFilters, timezone)

            expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
                dynamicOverallAutomatedInteractionsQueryFactoryV2({
                    filters: mockFilters,
                    timezone,
                }),
                dynamicOverallAutomatedInteractionsQueryFactoryV2({
                    filters: {
                        ...mockFilters,
                        period: getPreviousPeriod(mockFilters.period),
                    },
                    timezone,
                }),
            )
            expect(
                mockFetchFilteredAutomatedInteractions,
            ).not.toHaveBeenCalled()
        })

        it('should return v2 trend data', async () => {
            const result = await fetchOverallAutomatedInteractionsTrend(
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

        it('should call fetchStatsMetricTrend and not fetchFilteredAutomatedInteractions', async () => {
            await fetchOverallAutomatedInteractionsTrend(mockFilters, timezone)

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(
                mockFetchFilteredAutomatedInteractions,
            ).not.toHaveBeenCalled()
        })
    })
})
