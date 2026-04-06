import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchFilteredAutomatedInteractions,
    useFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { formatCostSavedData } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicAllAgentsAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import {
    fetchAiAgentAllAgentsCostSavedTrend,
    useAiAgentAllAgentsCostSavedTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsCostSavedTrend'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

jest.mock('domains/reporting/hooks/automate/automationTrends')
jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
jest.mock(
    'domains/reporting/hooks/automate/useAutomationCostSavedTrend',
    () => ({
        formatCostSavedData: jest.fn(),
    }),
)
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')
jest.mock('pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter')
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')

const mockUseFilteredAutomatedInteractions = assumeMock(
    useFilteredAutomatedInteractions,
)
const mockFetchFilteredAutomatedInteractions = assumeMock(
    fetchFilteredAutomatedInteractions,
)
const mockUseAIAgentUserId = assumeMock(useAIAgentUserId)
const mockFormatCostSavedData = assumeMock(formatCostSavedData)
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)
const mockGetNewStatsFeatureFlagMigration = assumeMock(
    getNewStatsFeatureFlagMigration,
)
const mockUseGetNewStatsFeatureFlagMigration = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)
const mockApplyAiAgentFilter = assumeMock(applyAiAgentFilter)
const mockUseMoneySavedPerInteractionWithAutomate = assumeMock(
    useMoneySavedPerInteractionWithAutomate,
)

const mockFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
} as StatsFilters

const mockFilteredFilters: StatsFilters = {
    ...mockFilters,
    agents: { values: [42], operator: 'eq' },
} as unknown as StatsFilters

const timezone = 'UTC'
const aiAgentUserId = 42

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

describe('useAiAgentAllAgentsCostSavedTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAIAgentUserId.mockReturnValue(aiAgentUserId)
        mockApplyAiAgentFilter.mockReturnValue(mockFilteredFilters)
        mockUseMoneySavedPerInteractionWithAutomate.mockReturnValue(
            AGENT_COST_PER_TICKET,
        )
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue('off')
        mockUseFilteredAutomatedInteractions.mockReturnValue(mockV1Trend)
        mockUseStatsMetricTrend.mockReturnValue(mockV2Trend)
        mockFormatCostSavedData.mockReturnValue({
            value: 100 * AGENT_COST_PER_TICKET,
            prevValue: 80 * AGENT_COST_PER_TICKET,
        })
    })

    const renderCostSavedTrendHook = () =>
        renderHook(() =>
            useAiAgentAllAgentsCostSavedTrend(mockFilters, timezone),
        )

    it('should apply AI agent filter with the correct userId', () => {
        renderCostSavedTrendHook()

        expect(mockApplyAiAgentFilter).toHaveBeenCalledWith(
            mockFilters,
            aiAgentUserId,
        )
    })

    it('should handle undefined aiAgentUserId', () => {
        mockUseAIAgentUserId.mockReturnValue(undefined)

        renderCostSavedTrendHook()

        expect(mockApplyAiAgentFilter).toHaveBeenCalledWith(
            mockFilters,
            undefined,
        )
    })

    it('should call useGetNewStatsFeatureFlagMigration with the correct metric name', () => {
        renderCostSavedTrendHook()

        expect(mockUseGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATED_INTERACTIONS,
        )
    })

    it('should call useMoneySavedPerInteractionWithAutomate with AGENT_COST_PER_TICKET', () => {
        renderCostSavedTrendHook()

        expect(
            mockUseMoneySavedPerInteractionWithAutomate,
        ).toHaveBeenCalledWith(AGENT_COST_PER_TICKET)
    })

    describe('when feature flag is off', () => {
        it('should call useFilteredAutomatedInteractions with filtered filters and enabled=true', () => {
            renderCostSavedTrendHook()

            expect(mockUseFilteredAutomatedInteractions).toHaveBeenCalledWith(
                mockFilteredFilters,
                timezone,
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

        it('should return formatted cost saved data from v1 trend', () => {
            const { result } = renderCostSavedTrendHook()

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
            mockUseGetNewStatsFeatureFlagMigration.mockReturnValue('live')
            mockFormatCostSavedData.mockReturnValue({
                value: 120 * AGENT_COST_PER_TICKET,
                prevValue: 95 * AGENT_COST_PER_TICKET,
            })
        })

        it('should call useFilteredAutomatedInteractions with enabled=false', () => {
            renderCostSavedTrendHook()

            expect(mockUseFilteredAutomatedInteractions).toHaveBeenCalledWith(
                mockFilteredFilters,
                timezone,
                false,
            )
        })

        it('should call useStatsMetricTrend with current and previous period queries', () => {
            renderCostSavedTrendHook()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                    filters: mockFilteredFilters,
                    timezone,
                }),
                dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                    filters: {
                        ...mockFilteredFilters,
                        period: getPreviousPeriod(mockFilteredFilters.period),
                    },
                    timezone,
                }),
                true,
            )
        })

        it('should return formatted cost saved data from v2 trend', () => {
            const { result } = renderCostSavedTrendHook()

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
            mockUseGetNewStatsFeatureFlagMigration.mockReturnValue('complete')
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
                mockFilteredFilters,
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

describe('fetchAiAgentAllAgentsCostSavedTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockApplyAiAgentFilter.mockReturnValue(mockFilteredFilters)
        mockGetNewStatsFeatureFlagMigration.mockResolvedValue('off')
        mockFetchFilteredAutomatedInteractions.mockResolvedValue(mockV1Trend)
        mockFetchStatsMetricTrend.mockResolvedValue(mockV2Trend)
        mockFormatCostSavedData.mockReturnValue({
            value: 100 * AGENT_COST_PER_TICKET,
            prevValue: 80 * AGENT_COST_PER_TICKET,
        })
    })

    it('should apply AI agent filter and call fetchFilteredAutomatedInteractions when flag is off', async () => {
        await fetchAiAgentAllAgentsCostSavedTrend(
            mockFilters,
            timezone,
            aiAgentUserId,
            AGENT_COST_PER_TICKET,
        )

        expect(mockApplyAiAgentFilter).toHaveBeenCalledWith(
            mockFilters,
            aiAgentUserId,
        )
        expect(mockFetchFilteredAutomatedInteractions).toHaveBeenCalledWith(
            mockFilteredFilters,
            timezone,
        )
        expect(mockFetchStatsMetricTrend).not.toHaveBeenCalled()
    })

    it('should handle undefined aiAgentUserId', async () => {
        await fetchAiAgentAllAgentsCostSavedTrend(
            mockFilters,
            timezone,
            undefined,
            AGENT_COST_PER_TICKET,
        )

        expect(mockApplyAiAgentFilter).toHaveBeenCalledWith(
            mockFilters,
            undefined,
        )
    })

    it('should call getNewStatsFeatureFlagMigration with the correct metric name', async () => {
        await fetchAiAgentAllAgentsCostSavedTrend(
            mockFilters,
            timezone,
            aiAgentUserId,
            AGENT_COST_PER_TICKET,
        )

        expect(mockGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATED_INTERACTIONS,
        )
    })

    it('should return formatted cost saved data from v1 trend when flag is off', async () => {
        const result = await fetchAiAgentAllAgentsCostSavedTrend(
            mockFilters,
            timezone,
            aiAgentUserId,
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

    describe('when feature flag is live', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('live')
            mockFormatCostSavedData.mockReturnValue({
                value: 120 * AGENT_COST_PER_TICKET,
                prevValue: 95 * AGENT_COST_PER_TICKET,
            })
        })

        it('should call fetchStatsMetricTrend and not fetchFilteredAutomatedInteractions', async () => {
            await fetchAiAgentAllAgentsCostSavedTrend(
                mockFilters,
                timezone,
                aiAgentUserId,
                AGENT_COST_PER_TICKET,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(
                mockFetchFilteredAutomatedInteractions,
            ).not.toHaveBeenCalled()
        })

        it('should call fetchStatsMetricTrend with current and previous period queries', async () => {
            await fetchAiAgentAllAgentsCostSavedTrend(
                mockFilters,
                timezone,
                aiAgentUserId,
                AGENT_COST_PER_TICKET,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
                dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                    filters: mockFilteredFilters,
                    timezone,
                }),
                dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                    filters: {
                        ...mockFilteredFilters,
                        period: getPreviousPeriod(mockFilteredFilters.period),
                    },
                    timezone,
                }),
            )
        })

        it('should return formatted cost saved data from v2 trend', async () => {
            const result = await fetchAiAgentAllAgentsCostSavedTrend(
                mockFilters,
                timezone,
                aiAgentUserId,
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
            await fetchAiAgentAllAgentsCostSavedTrend(
                mockFilters,
                timezone,
                aiAgentUserId,
                AGENT_COST_PER_TICKET,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(
                mockFetchFilteredAutomatedInteractions,
            ).not.toHaveBeenCalled()
        })
    })
})
