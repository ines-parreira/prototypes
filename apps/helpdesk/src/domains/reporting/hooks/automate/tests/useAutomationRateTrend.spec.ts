import { renderHook, waitFor } from '@testing-library/react'

import { getAutomationRateUnfilteredDenominatorTrend } from 'domains/reporting/hooks/automate/automateStatsCalculatedTrends'
import {
    fetchAllAutomatedInteractions,
    fetchAllAutomatedInteractionsByAutoResponders,
    fetchBillableTicketsExcludingAIAgent,
    fetchFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    fetchAutomationRateTrend,
    useAutomationRateTrend,
} from 'domains/reporting/hooks/automate/useAutomationRateTrend'
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

describe('useAutomationRateTrend', () => {
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
        ;(fetchFilteredAutomatedInteractions as jest.Mock).mockResolvedValue(
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
            getAutomationRateUnfilteredDenominatorTrend as jest.Mock
        ).mockReturnValue({
            data: { value: 0.5, prevValue: 0.4 },
            isFetching: false,
            isError: false,
        })

        renderHook(() => useAutomationRateTrend(mockFilters, mockTimezone))

        await waitFor(() => {
            expect(fetchAllAutomatedInteractions).toHaveBeenCalled()
        })

        expect(fetchFilteredAutomatedInteractions).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
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
        ;(fetchFilteredAutomatedInteractions as jest.Mock).mockResolvedValue(
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
            getAutomationRateUnfilteredDenominatorTrend as jest.Mock
        ).mockReturnValue({
            data: { value: 0.6, prevValue: 0.5 },
            isFetching: false,
            isError: false,
        })

        renderHook(() => useAutomationRateTrend(mockFilters, mockTimezone))

        await waitFor(() => {
            expect(fetchAllAutomatedInteractions).toHaveBeenCalled()
        })

        expect(
            getAutomationRateUnfilteredDenominatorTrend,
        ).toHaveBeenCalledWith({
            isFetching: false,
            isError: false,
            filteredAutomatedInteractions: mockTrendData.data,
            allAutomatedInteractions: mockTrendData.data,
            allAutomatedInteractionsByAutoResponders: mockTrendData.data,
            billableTicketsCount: mockTrendData.data,
        })
    })

    it('should handle loading state correctly', async () => {
        ;(fetchFilteredAutomatedInteractions as jest.Mock).mockReturnValue(
            new Promise(() => {}),
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
            getAutomationRateUnfilteredDenominatorTrend as jest.Mock
        ).mockReturnValue({
            data: { value: 0.5, prevValue: 0.4 },
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() =>
            useAutomationRateTrend(mockFilters, mockTimezone),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should not fetch and have isFetching=false when disabled', () => {
        const { result } = renderHook(() =>
            useAutomationRateTrend(mockFilters, mockTimezone, false),
        )

        expect(fetchFilteredAutomatedInteractions).not.toHaveBeenCalled()
        expect(fetchAllAutomatedInteractions).not.toHaveBeenCalled()
        expect(result.current.isFetching).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should handle error state correctly', async () => {
        ;(fetchFilteredAutomatedInteractions as jest.Mock).mockResolvedValue({
            ...mockTrendData,
            isError: true,
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
            getAutomationRateUnfilteredDenominatorTrend as jest.Mock
        ).mockReturnValue({
            data: { value: 0.5, prevValue: 0.4 },
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() =>
            useAutomationRateTrend(mockFilters, mockTimezone),
        )

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })
    })
})

describe('fetchAutomationRateTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const mockTrendData = {
        data: { value: 100, prevValue: 80 },
        isFetching: false,
        isError: false,
    }

    it('should fetch all required data and calculate result', async () => {
        ;(fetchFilteredAutomatedInteractions as jest.Mock).mockResolvedValue(
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
            getAutomationRateUnfilteredDenominatorTrend as jest.Mock
        ).mockReturnValue({
            data: { value: 0.5, prevValue: 0.4 },
            isFetching: false,
            isError: false,
        })

        const result = await fetchAutomationRateTrend(
            mockFilters,
            mockTimezone,
            12345,
        )

        expect(result).toEqual({
            data: { value: 0.5, prevValue: 0.4 },
            isFetching: false,
            isError: false,
        })

        expect(fetchFilteredAutomatedInteractions).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
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
            getAutomationRateUnfilteredDenominatorTrend,
        ).toHaveBeenCalledWith({
            isFetching: false,
            isError: false,
            filteredAutomatedInteractions: mockTrendData.data,
            allAutomatedInteractions: mockTrendData.data,
            allAutomatedInteractionsByAutoResponders: mockTrendData.data,
            billableTicketsCount: mockTrendData.data,
        })
    })
})
