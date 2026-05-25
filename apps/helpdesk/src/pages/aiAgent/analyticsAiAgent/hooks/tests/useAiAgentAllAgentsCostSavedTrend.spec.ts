import { assumeMock, renderHook } from '@repo/testing'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { formatCostSavedData } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { allAgentsAutomatedInteractionsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiAgentAllAgentsCostSavedTrend,
    useAiAgentAllAgentsCostSavedTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsCostSavedTrend'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
jest.mock(
    'domains/reporting/hooks/automate/useAutomationCostSavedTrend',
    () => ({
        formatCostSavedData: jest.fn(),
    }),
)
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter')
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')

const mockUseAIAgentUserId = assumeMock(useAIAgentUserId)
const mockFormatCostSavedData = assumeMock(formatCostSavedData)
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)
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

const mockTrend = {
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
        mockUseStatsMetricTrend.mockReturnValue(mockTrend)
        mockFormatCostSavedData.mockReturnValue({
            value: 120 * AGENT_COST_PER_TICKET,
            prevValue: 95 * AGENT_COST_PER_TICKET,
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

    it('should call useMoneySavedPerInteractionWithAutomate with AGENT_COST_PER_TICKET', () => {
        renderCostSavedTrendHook()

        expect(
            mockUseMoneySavedPerInteractionWithAutomate,
        ).toHaveBeenCalledWith(AGENT_COST_PER_TICKET)
    })

    it('should call useStatsMetricTrend with current and previous period V2 queries', () => {
        renderCostSavedTrendHook()

        expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
            allAgentsAutomatedInteractionsValueQueryFactoryV2({
                filters: mockFilteredFilters,
                timezone,
            }),
            allAgentsAutomatedInteractionsValueQueryFactoryV2({
                filters: {
                    ...mockFilteredFilters,
                    period: getPreviousPeriod(mockFilteredFilters.period),
                },
                timezone,
            }),
        )
    })

    it('should return formatted cost saved data', () => {
        const { result } = renderCostSavedTrendHook()

        expect(mockFormatCostSavedData).toHaveBeenCalledWith(
            mockTrend,
            AGENT_COST_PER_TICKET,
        )
        expect(result.current.data).toEqual({
            value: 120 * AGENT_COST_PER_TICKET,
            prevValue: 95 * AGENT_COST_PER_TICKET,
        })
    })

    it('should propagate isFetching=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isFetching: true,
        })

        const { result } = renderCostSavedTrendHook()

        expect(result.current.isFetching).toBe(true)
    })

    it('should propagate isError=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
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
        mockFetchStatsMetricTrend.mockResolvedValue(mockTrend)
        mockFormatCostSavedData.mockReturnValue({
            value: 120 * AGENT_COST_PER_TICKET,
            prevValue: 95 * AGENT_COST_PER_TICKET,
        })
    })

    it('should apply AI agent filter with the correct userId', async () => {
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

    it('should call fetchStatsMetricTrend with current and previous period V2 queries', async () => {
        await fetchAiAgentAllAgentsCostSavedTrend(
            mockFilters,
            timezone,
            aiAgentUserId,
            AGENT_COST_PER_TICKET,
        )

        expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
            allAgentsAutomatedInteractionsValueQueryFactoryV2({
                filters: mockFilteredFilters,
                timezone,
            }),
            allAgentsAutomatedInteractionsValueQueryFactoryV2({
                filters: {
                    ...mockFilteredFilters,
                    period: getPreviousPeriod(mockFilteredFilters.period),
                },
                timezone,
            }),
        )
    })

    it('should return formatted cost saved data', async () => {
        const result = await fetchAiAgentAllAgentsCostSavedTrend(
            mockFilters,
            timezone,
            aiAgentUserId,
            AGENT_COST_PER_TICKET,
        )

        expect(mockFormatCostSavedData).toHaveBeenCalledWith(
            mockTrend,
            AGENT_COST_PER_TICKET,
        )
        expect(result.data).toEqual({
            value: 120 * AGENT_COST_PER_TICKET,
            prevValue: 95 * AGENT_COST_PER_TICKET,
        })
    })
})
