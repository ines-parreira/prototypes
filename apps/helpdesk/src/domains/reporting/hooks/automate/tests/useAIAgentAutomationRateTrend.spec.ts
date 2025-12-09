import { renderHook, waitFor } from '@testing-library/react'

import { getAIAgentAutomationRateUnfilteredDenominatorTrend } from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchTrendFromMultipleMetricsTrend,
} from 'domains/reporting/hooks/automate/automationTrends'
import {
    fetchAIAgentAutomationRateTrend,
    useAIAgentAutomationRateTrend,
} from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { AutomationDatasetMeasure } from 'domains/reporting/models/cubes/automate_v2/AutomationDatasetCube'
import { aiAgentAutomatedInteractionsQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/metrics'
import { aiAgentAutomatedInteractionsQueryV2Factory } from 'domains/reporting/models/scopes/automatedInteractions'
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

    it('should call hooks with correct parameters', async () => {
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

        renderHook(() =>
            useAIAgentAutomationRateTrend(mockFilters, mockTimezone),
        )

        await waitFor(() => {
            expect(fetchAllAutomatedInteractions).toHaveBeenCalled()
        })

        expect(fetchTrendFromMultipleMetricsTrend).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
            aiAgentAutomatedInteractionsQueryFactory,
            AutomationDatasetMeasure.AutomatedInteractions,
            aiAgentAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
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
    })

    it('should use unfiltered denominator calculation', async () => {
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
            data: { value: 0.6, prevValue: 0.5 },
            isFetching: false,
            isError: false,
        })

        renderHook(() =>
            useAIAgentAutomationRateTrend(mockFilters, mockTimezone),
        )

        await waitFor(() => {
            expect(fetchAllAutomatedInteractions).toHaveBeenCalled()
        })

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

    it('should handle loading state correctly', async () => {
        ;(fetchTrendFromMultipleMetricsTrend as jest.Mock).mockReturnValue({
            ...mockTrendData,
            isFetching: true,
        })
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
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() =>
            useAIAgentAutomationRateTrend(mockFilters, mockTimezone),
        )

        await waitFor(() => {
            expect(fetchAllAutomatedInteractions).toHaveBeenCalled()
        })

        expect(result.current.isFetching).toBe(true)
    })

    it('should handle error state correctly', async () => {
        ;(fetchTrendFromMultipleMetricsTrend as jest.Mock).mockResolvedValue(
            mockTrendData,
        )
        ;(
            fetchAllAutomatedInteractionsByAutoResponders as jest.Mock
        ).mockResolvedValue(mockTrendData)
        ;(fetchAllAutomatedInteractions as jest.Mock).mockResolvedValue({
            ...mockTrendData,
            isError: true,
        })
        ;(fetchBillableTicketsExcludingAIAgent as jest.Mock).mockResolvedValue(
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

        await waitFor(() => {
            expect(fetchAllAutomatedInteractions).toHaveBeenCalled()
        })

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
            aiAgentAutomatedInteractionsQueryV2Factory,
            'automatedInteractions',
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
