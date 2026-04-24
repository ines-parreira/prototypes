import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchFilteredAutomatedInteractions,
    useFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import { formatCostSavedData } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicSupportAgentAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import {
    fetchAiAgentSupportCostSaved,
    useAiAgentSupportCostSaved,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportCostSaved'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

jest.mock('domains/reporting/hooks/automate/automationTrends')
jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock(
    'domains/reporting/hooks/automate/useAutomationCostSavedTrend',
    () => ({
        formatCostSavedData: jest.fn(),
    }),
)
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
const mockUseAiAgentStatsFilters = assumeMock(useAiAgentStatsFilters)
const mockFormatCostSavedData = assumeMock(formatCostSavedData)
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)
const mockGetNewStatsFeatureFlagMigration = assumeMock(
    getNewStatsFeatureFlagMigration,
)
const mockUseGetNewStatsFeatureFlagMigration = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)
const mockUseMoneySavedPerInteractionWithAutomate = assumeMock(
    useMoneySavedPerInteractionWithAutomate,
)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00.000',
        end_datetime: '2024-01-31T23:59:59.000',
    },
}
const timezone = 'UTC'

const mockV1Trend = {
    data: { value: 100, prevValue: 80 },
    isFetching: false,
    isError: false,
}

const mockV2Trend = {
    data: { value: 120, prevValue: 95 },
    isFetching: false,
    isError: false,
}

describe('useAiAgentSupportCostSaved', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters,
            userTimezone: timezone,
            granularity: ReportingGranularity.Day,
        })
        mockUseMoneySavedPerInteractionWithAutomate.mockReturnValue(
            AGENT_COST_PER_TICKET,
        )
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
            stage: 'off',
            isLoading: false,
        })
        mockUseFilteredAutomatedInteractions.mockReturnValue(mockV1Trend)
        mockUseStatsMetricTrend.mockReturnValue(mockV2Trend)
        mockFormatCostSavedData.mockReturnValue({
            value: 100 * AGENT_COST_PER_TICKET,
            prevValue: 80 * AGENT_COST_PER_TICKET,
        })
    })

    const renderCostSavedHook = () =>
        renderHook(() => useAiAgentSupportCostSaved())

    it('should call useGetNewStatsFeatureFlagMigration with the correct metric name', () => {
        renderCostSavedHook()

        expect(mockUseGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_AUTOMATED_INTERACTIONS,
        )
    })

    it('should call useMoneySavedPerInteractionWithAutomate with AGENT_COST_PER_TICKET', () => {
        renderCostSavedHook()

        expect(
            mockUseMoneySavedPerInteractionWithAutomate,
        ).toHaveBeenCalledWith(AGENT_COST_PER_TICKET)
    })

    describe('when feature flag is off', () => {
        it('should call useFilteredAutomatedInteractions with enabled=true', () => {
            renderCostSavedHook()

            expect(mockUseFilteredAutomatedInteractions).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                true,
            )
        })

        it('should call useStatsMetricTrend with enabled=false', () => {
            renderCostSavedHook()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                false,
            )
        })

        it('should return formatted cost saved data from v1 trend', () => {
            const { result } = renderCostSavedHook()

            expect(mockFormatCostSavedData).toHaveBeenCalledWith(
                mockV1Trend,
                AGENT_COST_PER_TICKET,
            )
            expect(result.current.data).toEqual({
                value: 100 * AGENT_COST_PER_TICKET,
                prevValue: 80 * AGENT_COST_PER_TICKET,
            })
        })
    })

    describe('when feature flag is live', () => {
        beforeEach(() => {
            mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
                stage: 'live',
                isLoading: false,
            })
            mockFormatCostSavedData.mockReturnValue({
                value: 120 * AGENT_COST_PER_TICKET,
                prevValue: 95 * AGENT_COST_PER_TICKET,
            })
        })

        it('should call useFilteredAutomatedInteractions with enabled=false', () => {
            renderCostSavedHook()

            expect(mockUseFilteredAutomatedInteractions).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                false,
            )
        })

        it('should call useStatsMetricTrend with current and previous period queries', () => {
            renderCostSavedHook()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
                    filters: statsFilters,
                    timezone,
                }),
                dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
                true,
            )
        })

        it('should return formatted cost saved data from v2 trend', () => {
            const { result } = renderCostSavedHook()

            expect(mockFormatCostSavedData).toHaveBeenCalledWith(
                mockV2Trend,
                AGENT_COST_PER_TICKET,
            )
            expect(result.current.data).toEqual({
                value: 120 * AGENT_COST_PER_TICKET,
                prevValue: 95 * AGENT_COST_PER_TICKET,
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
            renderCostSavedHook()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                true,
            )
        })

        it('should call useFilteredAutomatedInteractions with enabled=false', () => {
            renderCostSavedHook()

            expect(mockUseFilteredAutomatedInteractions).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                false,
            )
        })
    })

    it('should propagate isFetching=true from v1 trend', () => {
        mockUseFilteredAutomatedInteractions.mockReturnValue({
            ...mockV1Trend,
            isFetching: true,
        })

        const { result } = renderCostSavedHook()

        expect(result.current.isFetching).toBe(true)
    })

    it('should propagate isError=true from v1 trend', () => {
        mockUseFilteredAutomatedInteractions.mockReturnValue({
            ...mockV1Trend,
            isError: true,
        })

        const { result } = renderCostSavedHook()

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchAiAgentSupportCostSaved', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockGetNewStatsFeatureFlagMigration.mockResolvedValue('off')
        mockFetchFilteredAutomatedInteractions.mockResolvedValue(mockV1Trend)
        mockFetchStatsMetricTrend.mockResolvedValue(mockV2Trend)
        mockFormatCostSavedData.mockReturnValue({
            value: 100 * AGENT_COST_PER_TICKET,
            prevValue: 80 * AGENT_COST_PER_TICKET,
        })
    })

    it('should call getNewStatsFeatureFlagMigration with the correct metric name', async () => {
        await fetchAiAgentSupportCostSaved(
            statsFilters,
            timezone,
            undefined,
            AGENT_COST_PER_TICKET,
        )

        expect(mockGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_AUTOMATED_INTERACTIONS,
        )
    })

    describe('when feature flag is off', () => {
        it('should call fetchFilteredAutomatedInteractions and not fetchStatsMetricTrend', async () => {
            await fetchAiAgentSupportCostSaved(
                statsFilters,
                timezone,
                undefined,
                AGENT_COST_PER_TICKET,
            )

            expect(mockFetchFilteredAutomatedInteractions).toHaveBeenCalledWith(
                statsFilters,
                timezone,
            )
            expect(mockFetchStatsMetricTrend).not.toHaveBeenCalled()
        })

        it('should return formatted cost saved data from v1 trend', async () => {
            const result = await fetchAiAgentSupportCostSaved(
                statsFilters,
                timezone,
                undefined,
                AGENT_COST_PER_TICKET,
            )

            expect(mockFormatCostSavedData).toHaveBeenCalledWith(
                mockV1Trend,
                AGENT_COST_PER_TICKET,
            )
            expect(result.data).toEqual({
                value: 100 * AGENT_COST_PER_TICKET,
                prevValue: 80 * AGENT_COST_PER_TICKET,
            })
        })
    })

    describe('when feature flag is live', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('live')
            mockFormatCostSavedData.mockReturnValue({
                value: 120 * AGENT_COST_PER_TICKET,
                prevValue: 95 * AGENT_COST_PER_TICKET,
            })
        })

        it('should call fetchStatsMetricTrend and not fetchFilteredAutomatedInteractions', async () => {
            await fetchAiAgentSupportCostSaved(
                statsFilters,
                timezone,
                undefined,
                AGENT_COST_PER_TICKET,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(
                mockFetchFilteredAutomatedInteractions,
            ).not.toHaveBeenCalled()
        })

        it('should call fetchStatsMetricTrend with current and previous period queries', async () => {
            await fetchAiAgentSupportCostSaved(
                statsFilters,
                timezone,
                undefined,
                AGENT_COST_PER_TICKET,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
                dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
                    filters: statsFilters,
                    timezone,
                }),
                dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone,
                }),
            )
        })

        it('should return formatted cost saved data from v2 trend', async () => {
            const result = await fetchAiAgentSupportCostSaved(
                statsFilters,
                timezone,
                undefined,
                AGENT_COST_PER_TICKET,
            )

            expect(mockFormatCostSavedData).toHaveBeenCalledWith(
                mockV2Trend,
                AGENT_COST_PER_TICKET,
            )
            expect(result.data).toEqual({
                value: 120 * AGENT_COST_PER_TICKET,
                prevValue: 95 * AGENT_COST_PER_TICKET,
            })
        })
    })

    describe('when feature flag is complete', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('complete')
        })

        it('should call fetchStatsMetricTrend and not fetchFilteredAutomatedInteractions', async () => {
            await fetchAiAgentSupportCostSaved(
                statsFilters,
                timezone,
                undefined,
                AGENT_COST_PER_TICKET,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(
                mockFetchFilteredAutomatedInteractions,
            ).not.toHaveBeenCalled()
        })
    })
})
