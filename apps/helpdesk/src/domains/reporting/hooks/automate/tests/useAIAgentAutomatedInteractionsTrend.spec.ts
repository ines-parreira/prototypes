import { renderHook } from '@testing-library/react'

import {
    fetchTrendFromMultipleMetricsTrend,
    useTrendFromMultipleMetricsTrend,
} from 'domains/reporting/hooks/automate/automationTrends'
import {
    fetchAIAgentAutomatedInteractionsTrend,
    useAIAgentAutomatedInteractionsTrend,
} from 'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { aiAgentAutomatedInteractionsQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import { StatsFilters } from 'domains/reporting/models/stat/types'

jest.mock('domains/reporting/hooks/automate/automationTrends')

const mockFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}

const mockTimezone = 'America/New_York'

describe('useAIAgentAutomatedInteractionsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call useTrendFromMultipleMetricsTrend with correct parameters', () => {
        renderHook(() =>
            useAIAgentAutomatedInteractionsTrend(mockFilters, mockTimezone),
        )

        expect(useTrendFromMultipleMetricsTrend).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
            aiAgentAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
        )
    })

    it('should return the value from useTrendFromMultipleMetricsTrend', () => {
        const mockReturnValue = {
            data: { value: 100, prevValue: 80 },
            isFetching: false,
            isError: false,
        }

        ;(useTrendFromMultipleMetricsTrend as jest.Mock).mockReturnValue(
            mockReturnValue,
        )

        const { result } = renderHook(() =>
            useAIAgentAutomatedInteractionsTrend(mockFilters, mockTimezone),
        )

        expect(result.current).toBe(mockReturnValue)
    })
})

describe('fetchAIAgentAutomatedInteractionsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call fetchTrendFromMultipleMetricsTrend with correct parameters', async () => {
        const mockReturnValue = {
            data: { value: 100, prevValue: 80 },
            isFetching: false,
            isError: false,
        }

        ;(fetchTrendFromMultipleMetricsTrend as jest.Mock).mockResolvedValue(
            mockReturnValue,
        )

        const result = await fetchAIAgentAutomatedInteractionsTrend(
            mockFilters,
            mockTimezone,
        )

        expect(fetchTrendFromMultipleMetricsTrend).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
            aiAgentAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
        )

        expect(result).toBe(mockReturnValue)
    })
})
