import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

import {
    getLast28DaysDateRange,
    useAllResourcesMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import useAppSelector from 'hooks/useAppSelector'

import { useSkillsMetrics } from './useSkillsMetrics'

jest.mock(
    'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics',
)
jest.mock('hooks/useAppSelector')

const mockGetLast28DaysDateRange = getLast28DaysDateRange as jest.Mock

const mockUseAllResourcesMetrics = useAllResourcesMetrics as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock

describe('useSkillsMetrics', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    const mockMetricsData = [
        {
            resourceSourceId: 1,
            tickets: 100,
            handoverTickets: 20,
            csat: 4.5,
            resourceSourceSetId: 123,
        },
        {
            resourceSourceId: 2,
            tickets: 50,
            handoverTickets: 10,
            csat: 4.0,
            resourceSourceSetId: 124,
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()

        mockUseAppSelector.mockReturnValue('America/New_York')
        mockGetLast28DaysDateRange.mockReturnValue({
            start_datetime: '2023-01-01T00:00:00Z',
            end_datetime: '2023-01-28T23:59:59Z',
        })
    })

    it('should return metrics data when available', () => {
        mockUseAllResourcesMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useSkillsMetrics(456, true), {
            wrapper,
        })

        expect(result.current.data).toEqual(mockMetricsData)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should handle loading state', () => {
        mockUseAllResourcesMetrics.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        })

        const { result } = renderHook(() => useSkillsMetrics(456, true), {
            wrapper,
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.data).toBeUndefined()
    })

    it('should handle error state', () => {
        mockUseAllResourcesMetrics.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        })

        const { result } = renderHook(() => useSkillsMetrics(456, true), {
            wrapper,
        })

        expect(result.current.isError).toBe(true)
    })

    it('should pass shop integration ID to useAllResourcesMetrics', () => {
        mockUseAllResourcesMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsMetrics(999, true), { wrapper })

        expect(mockUseAllResourcesMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                shopIntegrationId: 999,
            }),
        )
    })

    it('should pass timezone from selector to useAllResourcesMetrics', () => {
        mockUseAppSelector.mockReturnValue('Europe/London')
        mockUseAllResourcesMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsMetrics(456, true), { wrapper })

        expect(mockUseAllResourcesMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                timezone: 'Europe/London',
            }),
        )
    })

    it('should use UTC timezone when selector returns null', () => {
        mockUseAppSelector.mockReturnValue(null)
        mockUseAllResourcesMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsMetrics(456, true), { wrapper })

        expect(mockUseAllResourcesMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                timezone: 'UTC',
            }),
        )
    })

    it('should pass enabled flag when true', () => {
        mockUseAllResourcesMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsMetrics(456, true), { wrapper })

        expect(mockUseAllResourcesMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: true,
            }),
        )
    })

    it('should disable query when enabled is false', () => {
        mockUseAllResourcesMetrics.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsMetrics(456, false), { wrapper })

        expect(mockUseAllResourcesMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
        )
    })

    it('should disable query when shop integration ID is falsy', () => {
        mockUseAllResourcesMetrics.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsMetrics(0, true), { wrapper })

        expect(mockUseAllResourcesMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: false,
            }),
        )
    })

    it('should set loadIntents to false', () => {
        mockUseAllResourcesMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsMetrics(456, true), { wrapper })

        expect(mockUseAllResourcesMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                loadIntents: false,
            }),
        )
    })

    it('should pass last 28 days date range', () => {
        mockUseAllResourcesMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsMetrics(456, true), { wrapper })

        expect(mockUseAllResourcesMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                dateRange: expect.objectContaining({
                    start_datetime: expect.any(String),
                    end_datetime: expect.any(String),
                }),
            }),
        )
    })

    it('should default enabled to true when not provided', () => {
        mockUseAllResourcesMetrics.mockReturnValue({
            data: mockMetricsData,
            isLoading: false,
            isError: false,
        })

        renderHook(() => useSkillsMetrics(456), { wrapper })

        expect(mockUseAllResourcesMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                enabled: true,
            }),
        )
    })
})
