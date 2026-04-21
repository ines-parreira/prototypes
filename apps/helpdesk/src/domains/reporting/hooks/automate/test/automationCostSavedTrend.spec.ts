import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchFilteredAutomatedInteractions,
    useFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import {
    fetchAutomationCostSavedTrend,
    formatCostSavedData,
    useAutomationCostSavedTrend,
} from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicOverallAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

jest.mock('domains/reporting/hooks/automate/automationTrends')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')

const mockUseFilteredAutomatedInteractions = assumeMock(
    useFilteredAutomatedInteractions,
)
const mockFetchFilteredAutomatedInteractions = assumeMock(
    fetchFilteredAutomatedInteractions,
)
const mockUseMoneySavedPerInteractionWithAutomate = assumeMock(
    useMoneySavedPerInteractionWithAutomate,
)
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
        start_datetime: '2021-05-29T00:00:00.000',
        end_datetime: '2021-06-04T23:59:59.000',
    },
}
const userTimezone = 'UTC'
const moneySavedPerInteractionWithAutomate = 123

const mockV1Trend = {
    data: { value: 2, prevValue: 4 },
    isFetching: false,
    isError: false,
}

const mockV2Trend = {
    data: { value: 3, prevValue: 5 },
    isFetching: false,
    isError: false,
}

describe('useAutomationCostSavedTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseMoneySavedPerInteractionWithAutomate.mockReturnValue(
            moneySavedPerInteractionWithAutomate,
        )
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
            stage: 'off',
            isLoading: false,
        })
        mockUseFilteredAutomatedInteractions.mockReturnValue(mockV1Trend)
        mockUseStatsMetricTrend.mockReturnValue(mockV2Trend)
    })

    const renderCostSavedTrendHook = () =>
        renderHook(() =>
            useAutomationCostSavedTrend(statsFilters, userTimezone),
        )

    it('should call useGetNewStatsFeatureFlagMigration with the correct metric name', () => {
        renderCostSavedTrendHook()

        expect(mockUseGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_OVERALL_AUTOMATED_INTERACTIONS,
        )
    })

    describe('when feature flag is off', () => {
        it('should call useFilteredAutomatedInteractions with enabled=true', () => {
            renderCostSavedTrendHook()

            expect(mockUseFilteredAutomatedInteractions).toHaveBeenCalledWith(
                statsFilters,
                userTimezone,
                true,
            )
        })

        it('should call useStatsMetricTrend with enabled=false', () => {
            renderCostSavedTrendHook()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                false,
            )
        })

        it('should calculate and format trend from v1', () => {
            const { result } = renderCostSavedTrendHook()

            expect(result.current).toEqual({
                data: formatCostSavedData(
                    mockV1Trend,
                    moneySavedPerInteractionWithAutomate,
                ),
                isFetching: false,
                isError: false,
            })
        })

        it('should return 0s on empty data', () => {
            mockUseFilteredAutomatedInteractions.mockReturnValue({
                data: { value: null, prevValue: null },
                isFetching: false,
                isError: false,
            })

            const { result } = renderCostSavedTrendHook()

            expect(result.current.data).toEqual({ value: 0, prevValue: 0 })
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
            renderCostSavedTrendHook()

            expect(mockUseFilteredAutomatedInteractions).toHaveBeenCalledWith(
                statsFilters,
                userTimezone,
                false,
            )
        })

        it('should call useStatsMetricTrend with current and previous period queries', () => {
            renderCostSavedTrendHook()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                dynamicOverallAutomatedInteractionsQueryFactoryV2({
                    filters: statsFilters,
                    timezone: userTimezone,
                }),
                dynamicOverallAutomatedInteractionsQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone: userTimezone,
                }),
                true,
            )
        })

        it('should calculate and format trend from v2', () => {
            const { result } = renderCostSavedTrendHook()

            expect(result.current).toEqual({
                data: formatCostSavedData(
                    mockV2Trend,
                    moneySavedPerInteractionWithAutomate,
                ),
                isFetching: false,
                isError: false,
            })
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
            renderCostSavedTrendHook()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                true,
            )
        })

        it('should call useFilteredAutomatedInteractions with enabled=false', () => {
            renderCostSavedTrendHook()

            expect(mockUseFilteredAutomatedInteractions).toHaveBeenCalledWith(
                statsFilters,
                userTimezone,
                false,
            )
        })
    })

    it('should propagate isFetching=true from v1 trend', () => {
        mockUseFilteredAutomatedInteractions.mockReturnValue({
            ...mockV1Trend,
            isFetching: true,
        })

        const { result } = renderCostSavedTrendHook()

        expect(result.current.isFetching).toBe(true)
    })

    it('should propagate isError=true from v1 trend', () => {
        mockUseFilteredAutomatedInteractions.mockReturnValue({
            ...mockV1Trend,
            isError: true,
        })

        const { result } = renderCostSavedTrendHook()

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchAutomationCostSavedTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockGetNewStatsFeatureFlagMigration.mockResolvedValue('off')
        mockFetchFilteredAutomatedInteractions.mockResolvedValue(mockV1Trend)
        mockFetchStatsMetricTrend.mockResolvedValue(mockV2Trend)
    })

    it('should call getNewStatsFeatureFlagMigration with the correct metric name', async () => {
        await fetchAutomationCostSavedTrend(
            statsFilters,
            userTimezone,
            undefined,
            moneySavedPerInteractionWithAutomate,
        )

        expect(mockGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_OVERALL_AUTOMATED_INTERACTIONS,
        )
    })

    describe('when feature flag is off', () => {
        it('should call fetchFilteredAutomatedInteractions and not fetchStatsMetricTrend', async () => {
            await fetchAutomationCostSavedTrend(
                statsFilters,
                userTimezone,
                undefined,
                moneySavedPerInteractionWithAutomate,
            )

            expect(mockFetchFilteredAutomatedInteractions).toHaveBeenCalledWith(
                statsFilters,
                userTimezone,
            )
            expect(mockFetchStatsMetricTrend).not.toHaveBeenCalled()
        })

        it('should calculate and format trend', async () => {
            const result = await fetchAutomationCostSavedTrend(
                statsFilters,
                userTimezone,
                undefined,
                moneySavedPerInteractionWithAutomate,
            )

            expect(result).toEqual({
                data: formatCostSavedData(
                    mockV1Trend,
                    moneySavedPerInteractionWithAutomate,
                ),
                isFetching: false,
                isError: false,
            })
        })
    })

    describe('when feature flag is live', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('live')
        })

        it('should call fetchStatsMetricTrend and not fetchFilteredAutomatedInteractions', async () => {
            await fetchAutomationCostSavedTrend(
                statsFilters,
                userTimezone,
                undefined,
                moneySavedPerInteractionWithAutomate,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(
                mockFetchFilteredAutomatedInteractions,
            ).not.toHaveBeenCalled()
        })

        it('should call fetchStatsMetricTrend with current and previous period queries', async () => {
            await fetchAutomationCostSavedTrend(
                statsFilters,
                userTimezone,
                undefined,
                moneySavedPerInteractionWithAutomate,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
                dynamicOverallAutomatedInteractionsQueryFactoryV2({
                    filters: statsFilters,
                    timezone: userTimezone,
                }),
                dynamicOverallAutomatedInteractionsQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone: userTimezone,
                }),
            )
        })

        it('should calculate and format trend from v2', async () => {
            const result = await fetchAutomationCostSavedTrend(
                statsFilters,
                userTimezone,
                undefined,
                moneySavedPerInteractionWithAutomate,
            )

            expect(result).toEqual({
                data: formatCostSavedData(
                    mockV2Trend,
                    moneySavedPerInteractionWithAutomate,
                ),
                isFetching: false,
                isError: false,
            })
        })
    })

    describe('when feature flag is complete', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('complete')
        })

        it('should call fetchStatsMetricTrend and not fetchFilteredAutomatedInteractions', async () => {
            await fetchAutomationCostSavedTrend(
                statsFilters,
                userTimezone,
                undefined,
                moneySavedPerInteractionWithAutomate,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(
                mockFetchFilteredAutomatedInteractions,
            ).not.toHaveBeenCalled()
        })
    })
})
