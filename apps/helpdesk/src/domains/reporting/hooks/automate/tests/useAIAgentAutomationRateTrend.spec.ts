import { renderHook } from '@testing-library/react'

import { getAIAgentAutomationRateUnfilteredDenominatorTrend } from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchTrendFromMultipleMetricsTrend,
    useAllAutomatedInteractions,
    useAllAutomatedInteractionsByAutoResponders,
    useBillableTicketsExcludingAIAgent,
    useTrendFromMultipleMetricsTrend,
} from 'domains/reporting/hooks/automate/automationTrends'
import {
    fetchAIAgentAutomationRateTrend,
    useAIAgentAutomationRateTrend,
} from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { aiAgentAutomatedInteractionsQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

jest.mock('domains/reporting/hooks/automate/automationTrends')
jest.mock('domains/reporting/hooks/automate/useAIAgentUserId')
jest.mock('domains/reporting/hooks/automate/automateStatsCalculatedTrends')

const mockFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}

const mockTimezone = 'America/New_York'

describe('useAIAgentAutomationRateTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(useAIAgentUserId as jest.Mock).mockReturnValue(12345)
    })

    const mockTrendData = {
        data: { value: 100, prevValue: 80 },
        isFetching: false,
        isError: false,
    }

    it('should call hooks with correct parameters', () => {
        ;(useTrendFromMultipleMetricsTrend as jest.Mock).mockReturnValue(
            mockTrendData,
        )
        ;(
            useAllAutomatedInteractionsByAutoResponders as jest.Mock
        ).mockReturnValue(mockTrendData)
        ;(useAllAutomatedInteractions as jest.Mock).mockReturnValue(
            mockTrendData,
        )
        ;(useBillableTicketsExcludingAIAgent as jest.Mock).mockReturnValue(
            mockTrendData,
        )
        ;(
            getAIAgentAutomationRateUnfilteredDenominatorTrend as jest.Mock
        ).mockReturnValue({
            data: { value: 0.5, prevValue: 0.4 },
            isFetching: false,
            isError: false,
        })

        renderHook(() =>
            useAIAgentAutomationRateTrend(mockFilters, mockTimezone),
        )

        expect(useTrendFromMultipleMetricsTrend).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
            aiAgentAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
        )
        expect(
            useAllAutomatedInteractionsByAutoResponders,
        ).toHaveBeenCalledWith(mockFilters, mockTimezone)
        expect(useAllAutomatedInteractions).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
        )
        expect(useBillableTicketsExcludingAIAgent).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
            12345,
        )
    })

    it('should use unfiltered denominator calculation', () => {
        ;(useTrendFromMultipleMetricsTrend as jest.Mock).mockReturnValue(
            mockTrendData,
        )
        ;(
            useAllAutomatedInteractionsByAutoResponders as jest.Mock
        ).mockReturnValue(mockTrendData)
        ;(useAllAutomatedInteractions as jest.Mock).mockReturnValue(
            mockTrendData,
        )
        ;(useBillableTicketsExcludingAIAgent as jest.Mock).mockReturnValue(
            mockTrendData,
        )
        ;(
            getAIAgentAutomationRateUnfilteredDenominatorTrend as jest.Mock
        ).mockReturnValue({
            data: { value: 0.6, prevValue: 0.5 },
            isFetching: false,
            isError: false,
        })

        renderHook(() =>
            useAIAgentAutomationRateTrend(mockFilters, mockTimezone),
        )

        expect(
            getAIAgentAutomationRateUnfilteredDenominatorTrend,
        ).toHaveBeenCalledWith({
            isFetching: false,
            isError: false,
            aiAgentAutomatedInteractions: mockTrendData.data,
            allAutomatedInteractions: mockTrendData.data,
            allAutomatedInteractionsByAutoResponders: mockTrendData.data,
            billableTicketsCount: mockTrendData.data,
        })
    })

    it('should handle loading state correctly', () => {
        ;(useTrendFromMultipleMetricsTrend as jest.Mock).mockReturnValue({
            ...mockTrendData,
            isFetching: true,
        })
        ;(
            useAllAutomatedInteractionsByAutoResponders as jest.Mock
        ).mockReturnValue(mockTrendData)
        ;(useAllAutomatedInteractions as jest.Mock).mockReturnValue(
            mockTrendData,
        )
        ;(useBillableTicketsExcludingAIAgent as jest.Mock).mockReturnValue(
            mockTrendData,
        )
        ;(
            getAIAgentAutomationRateUnfilteredDenominatorTrend as jest.Mock
        ).mockReturnValue({
            data: { value: 0.5, prevValue: 0.4 },
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() =>
            useAIAgentAutomationRateTrend(mockFilters, mockTimezone),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should handle error state correctly', () => {
        ;(useTrendFromMultipleMetricsTrend as jest.Mock).mockReturnValue(
            mockTrendData,
        )
        ;(
            useAllAutomatedInteractionsByAutoResponders as jest.Mock
        ).mockReturnValue(mockTrendData)
        ;(useAllAutomatedInteractions as jest.Mock).mockReturnValue({
            ...mockTrendData,
            isError: true,
        })
        ;(useBillableTicketsExcludingAIAgent as jest.Mock).mockReturnValue(
            mockTrendData,
        )
        ;(
            getAIAgentAutomationRateUnfilteredDenominatorTrend as jest.Mock
        ).mockReturnValue({
            data: { value: 0.5, prevValue: 0.4 },
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() =>
            useAIAgentAutomationRateTrend(mockFilters, mockTimezone),
        )

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchAIAgentAutomationRateTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const mockTrendData = {
        data: { value: 100, prevValue: 80 },
        isFetching: false,
        isError: false,
    }

    it('should fetch all required data and calculate result', async () => {
        ;(fetchTrendFromMultipleMetricsTrend as jest.Mock).mockResolvedValue(
            mockTrendData,
        )
        ;(
            fetchAllAutomatedInteractionsByAutoResponders as jest.Mock
        ).mockResolvedValue(mockTrendData)
        ;(fetchAllAutomatedInteractions as jest.Mock).mockResolvedValue(
            mockTrendData,
        )
        ;(fetchBillableTicketsExcludingAIAgent as jest.Mock).mockResolvedValue(
            mockTrendData,
        )
        ;(
            getAIAgentAutomationRateUnfilteredDenominatorTrend as jest.Mock
        ).mockReturnValue({
            data: { value: 0.5, prevValue: 0.4 },
            isFetching: false,
            isError: false,
        })

        const result = await fetchAIAgentAutomationRateTrend(
            mockFilters,
            mockTimezone,
            12345,
        )

        expect(result).toEqual({
            data: { value: 0.5, prevValue: 0.4 },
            isFetching: false,
            isError: false,
        })

        expect(fetchTrendFromMultipleMetricsTrend).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
            aiAgentAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
        )
        expect(
            fetchAllAutomatedInteractionsByAutoResponders,
        ).toHaveBeenCalledWith(mockFilters, mockTimezone)
        expect(fetchAllAutomatedInteractions).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
        )
        expect(fetchBillableTicketsExcludingAIAgent).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
            12345,
        )
        expect(
            getAIAgentAutomationRateUnfilteredDenominatorTrend,
        ).toHaveBeenCalledWith({
            isFetching: false,
            isError: false,
            aiAgentAutomatedInteractions: mockTrendData.data,
            allAutomatedInteractions: mockTrendData.data,
            allAutomatedInteractionsByAutoResponders: mockTrendData.data,
            billableTicketsCount: mockTrendData.data,
        })
    })
})
