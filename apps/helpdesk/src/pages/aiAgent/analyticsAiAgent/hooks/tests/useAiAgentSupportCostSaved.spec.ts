import { assumeMock, renderHook } from '@repo/testing'

import { formatCostSavedData } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { supportAgentAutomatedInteractionsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import {
    fetchAiAgentSupportCostSaved,
    useAiAgentSupportCostSaved,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportCostSaved'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock(
    'domains/reporting/hooks/automate/useAutomationCostSavedTrend',
    () => ({
        formatCostSavedData: jest.fn(),
    }),
)
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate')

const mockUseAiAgentStatsFilters = assumeMock(useAiAgentStatsFilters)
const mockFormatCostSavedData = assumeMock(formatCostSavedData)
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)
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

const mockTrend = {
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
        mockUseStatsMetricTrend.mockReturnValue(mockTrend)
        mockFormatCostSavedData.mockReturnValue({
            value: 120 * AGENT_COST_PER_TICKET,
            prevValue: 95 * AGENT_COST_PER_TICKET,
        })
    })

    const renderCostSavedHook = () =>
        renderHook(() => useAiAgentSupportCostSaved())

    it('should call useMoneySavedPerInteractionWithAutomate with AGENT_COST_PER_TICKET', () => {
        renderCostSavedHook()

        expect(
            mockUseMoneySavedPerInteractionWithAutomate,
        ).toHaveBeenCalledWith(AGENT_COST_PER_TICKET)
    })

    it('should call useStatsMetricTrend with current and previous period V2 queries', () => {
        renderCostSavedHook()

        expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
            supportAgentAutomatedInteractionsValueQueryFactoryV2({
                filters: statsFilters,
                timezone,
            }),
            supportAgentAutomatedInteractionsValueQueryFactoryV2({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })

    it('should return formatted cost saved data', () => {
        const { result } = renderCostSavedHook()

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

        const { result } = renderCostSavedHook()

        expect(result.current.isFetching).toBe(true)
    })

    it('should propagate isError=true from trend', () => {
        mockUseStatsMetricTrend.mockReturnValue({
            ...mockTrend,
            isError: true,
        })

        const { result } = renderCostSavedHook()

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchAiAgentSupportCostSaved', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockFetchStatsMetricTrend.mockResolvedValue(mockTrend)
        mockFormatCostSavedData.mockReturnValue({
            value: 120 * AGENT_COST_PER_TICKET,
            prevValue: 95 * AGENT_COST_PER_TICKET,
        })
    })

    it('should call fetchStatsMetricTrend with current and previous period V2 queries', async () => {
        await fetchAiAgentSupportCostSaved(
            statsFilters,
            timezone,
            undefined,
            AGENT_COST_PER_TICKET,
        )

        expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
            supportAgentAutomatedInteractionsValueQueryFactoryV2({
                filters: statsFilters,
                timezone,
            }),
            supportAgentAutomatedInteractionsValueQueryFactoryV2({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone,
            }),
        )
    })

    it('should return formatted cost saved data', async () => {
        const result = await fetchAiAgentSupportCostSaved(
            statsFilters,
            timezone,
            undefined,
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
