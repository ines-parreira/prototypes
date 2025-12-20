import { renderHook } from '@testing-library/react'

import {
    fetchTrendFromMultipleMetricsTrend,
    useTrendFromMultipleMetricsTrend,
} from 'domains/reporting/hooks/automate/automationTrends'
import {
    fetchAiAgentSupportInteractionsTrend,
    useAiAgentSupportInteractionsTrend,
} from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTrend'
import { AIAgentInteractionsBySkillMeasure } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { aiAgentSupportInteractionsQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

jest.mock('domains/reporting/hooks/automate/automationTrends')

const mockFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}

const mockTimezone = 'America/New_York'

describe('useAiAgentSupportInteractionsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call useTrendFromMultipleMetricsTrend with correct parameters', () => {
        renderHook(() =>
            useAiAgentSupportInteractionsTrend(mockFilters, mockTimezone),
        )

        expect(useTrendFromMultipleMetricsTrend).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
            aiAgentSupportInteractionsQueryFactory,
            AIAgentInteractionsBySkillMeasure.Count,
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
            useAiAgentSupportInteractionsTrend(mockFilters, mockTimezone),
        )

        expect(result.current).toBe(mockReturnValue)
    })
})

describe('fetchAiAgentSupportInteractionsTrend', () => {
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

        const result = await fetchAiAgentSupportInteractionsTrend(
            mockFilters,
            mockTimezone,
        )

        expect(fetchTrendFromMultipleMetricsTrend).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
            aiAgentSupportInteractionsQueryFactory,
            AIAgentInteractionsBySkillMeasure.Count,
        )

        expect(result).toBe(mockReturnValue)
    })
})
