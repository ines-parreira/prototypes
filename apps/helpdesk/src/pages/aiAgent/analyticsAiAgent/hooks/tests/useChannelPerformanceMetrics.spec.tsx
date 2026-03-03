import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import * as channelMetricsHooks from 'domains/reporting/hooks/ai-sales-agent/channelMetrics'
import { AiSalesAgentConversationsDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { useChannelPerformanceMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useChannelPerformanceMetrics'

jest.mock('domains/reporting/hooks/ai-sales-agent/channelMetrics')

const mockChannelMetricsHooks = channelMetricsHooks as jest.Mocked<
    typeof channelMetricsHooks
>

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

const mockFilters = {
    [FilterKey.Period]: {
        start_datetime: '2024-01-01',
        end_datetime: '2024-01-31',
    },
}
const mockTimezone = 'UTC'

describe('useChannelPerformanceMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return loading state when queries are fetching', () => {
        mockChannelMetricsHooks.useHandoverInteractionsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: true,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useSnoozedInteractionsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: true,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useGmvInfluencedPerChannel.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        } as any)
        mockChannelMetricsHooks.useTotalSalesConversationsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: true,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useAutomatedSalesConversationsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: true,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useChannelPerformanceMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.loadingStates).toEqual({
            handoverInteractions: true,
            snoozedInteractions: true,
            totalSales: true,
            automationRate: true,
        })
        expect(result.current.data).toEqual([])
    })

    it('should return error state when any query fails', () => {
        mockChannelMetricsHooks.useHandoverInteractionsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
                isError: true,
            } as any,
        )
        mockChannelMetricsHooks.useSnoozedInteractionsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useGmvInfluencedPerChannel.mockReturnValue({
            data: null,
            isFetching: false,
            isError: false,
        } as any)
        mockChannelMetricsHooks.useTotalSalesConversationsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useAutomatedSalesConversationsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useChannelPerformanceMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        expect(result.current.isError).toBe(true)
    })

    it('should aggregate data from all channels correctly', async () => {
        const mockHandoverData = {
            allData: [
                {
                    [TicketDimension.Channel]: 'chat',
                    'TicketCustomFieldsEnriched.ticketCount': '100',
                },
                {
                    [TicketDimension.Channel]: 'email',
                    'TicketCustomFieldsEnriched.ticketCount': '50',
                },
            ],
        }

        const mockSnoozedData = {
            allData: [
                {
                    [TicketDimension.Channel]: 'chat',
                    'TicketCustomFieldsEnriched.ticketCount': '20',
                },
            ],
        }

        const mockGmvData = {
            allData: [
                {
                    [AiSalesAgentOrdersDimension.Channel]: 'chat',
                    'AiSalesAgentOrders.gmvUsd': '5000',
                },
            ],
        }

        const mockTotalConversations = {
            allData: [
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'chat',
                    'AiSalesAgentConversations.count': '150',
                },
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'email',
                    'AiSalesAgentConversations.count': '100',
                },
            ],
        }

        const mockAutomatedConversations = {
            allData: [
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'chat',
                    'AiSalesAgentConversations.count': '120',
                },
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'email',
                    'AiSalesAgentConversations.count': '90',
                },
            ],
        }

        mockChannelMetricsHooks.useHandoverInteractionsPerChannel.mockReturnValue(
            {
                data: mockHandoverData,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useSnoozedInteractionsPerChannel.mockReturnValue(
            {
                data: mockSnoozedData,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useGmvInfluencedPerChannel.mockReturnValue({
            data: mockGmvData,
            isFetching: false,
            isError: false,
        } as any)
        mockChannelMetricsHooks.useTotalSalesConversationsPerChannel.mockReturnValue(
            {
                data: mockTotalConversations,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useAutomatedSalesConversationsPerChannel.mockReturnValue(
            {
                data: mockAutomatedConversations,
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useChannelPerformanceMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(2)
        })

        expect(result.current.data).toEqual([
            {
                channel: 'chat',
                handoverInteractions: 100,
                snoozedInteractions: 20,
                totalSales: 5000,
                automationRate: 80, // 120/150 * 100
            },
            {
                channel: 'email',
                handoverInteractions: 50,
                snoozedInteractions: null,
                totalSales: null,
                automationRate: 90, // 90/100 * 100
            },
        ])
    })

    it('should handle channels with no data gracefully', async () => {
        const mockHandoverData = {
            allData: [
                {
                    [TicketDimension.Channel]: 'sms',
                    'TicketCustomFieldsEnriched.ticketCount': '10',
                },
            ],
        }

        mockChannelMetricsHooks.useHandoverInteractionsPerChannel.mockReturnValue(
            {
                data: mockHandoverData,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useSnoozedInteractionsPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useGmvInfluencedPerChannel.mockReturnValue({
            data: { allData: [] },
            isFetching: false,
            isError: false,
        } as any)
        mockChannelMetricsHooks.useTotalSalesConversationsPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useAutomatedSalesConversationsPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useChannelPerformanceMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })

        expect(result.current.data[0]).toEqual({
            channel: 'sms',
            handoverInteractions: 10,
            snoozedInteractions: null,
            totalSales: null,
            automationRate: null,
        })
    })

    it('should calculate automation rate correctly', async () => {
        const mockTotalConversations = {
            allData: [
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'chat',
                    'AiSalesAgentConversations.count': '200',
                },
            ],
        }

        const mockAutomatedConversations = {
            allData: [
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'chat',
                    'AiSalesAgentConversations.count': '150',
                },
            ],
        }

        mockChannelMetricsHooks.useHandoverInteractionsPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useSnoozedInteractionsPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useGmvInfluencedPerChannel.mockReturnValue({
            data: { allData: [] },
            isFetching: false,
            isError: false,
        } as any)
        mockChannelMetricsHooks.useTotalSalesConversationsPerChannel.mockReturnValue(
            {
                data: mockTotalConversations,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useAutomatedSalesConversationsPerChannel.mockReturnValue(
            {
                data: mockAutomatedConversations,
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useChannelPerformanceMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })

        expect(result.current.data[0].automationRate).toBe(75) // 150/200 * 100
    })

    it('should return null for automation rate when total is zero', async () => {
        const mockTotalConversations = {
            allData: [
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'chat',
                    'AiSalesAgentConversations.count': '0',
                },
            ],
        }

        const mockAutomatedConversations = {
            allData: [
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'chat',
                    'AiSalesAgentConversations.count': '0',
                },
            ],
        }

        mockChannelMetricsHooks.useHandoverInteractionsPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useSnoozedInteractionsPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useGmvInfluencedPerChannel.mockReturnValue({
            data: { allData: [] },
            isFetching: false,
            isError: false,
        } as any)
        mockChannelMetricsHooks.useTotalSalesConversationsPerChannel.mockReturnValue(
            {
                data: mockTotalConversations,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useAutomatedSalesConversationsPerChannel.mockReturnValue(
            {
                data: mockAutomatedConversations,
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useChannelPerformanceMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })

        expect(result.current.data[0].automationRate).toBeNull()
    })

    it('should sort channels alphabetically', async () => {
        const mockHandoverData = {
            allData: [
                {
                    [TicketDimension.Channel]: 'sms',
                    'TicketCustomFieldsEnriched.ticketCount': '10',
                },
                {
                    [TicketDimension.Channel]: 'chat',
                    'TicketCustomFieldsEnriched.ticketCount': '20',
                },
                {
                    [TicketDimension.Channel]: 'email',
                    'TicketCustomFieldsEnriched.ticketCount': '30',
                },
            ],
        }

        mockChannelMetricsHooks.useHandoverInteractionsPerChannel.mockReturnValue(
            {
                data: mockHandoverData,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useSnoozedInteractionsPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useGmvInfluencedPerChannel.mockReturnValue({
            data: { allData: [] },
            isFetching: false,
            isError: false,
        } as any)
        mockChannelMetricsHooks.useTotalSalesConversationsPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useAutomatedSalesConversationsPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useChannelPerformanceMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(3)
        })

        expect(result.current.data.map((d) => d.channel)).toEqual([
            'chat',
            'email',
            'sms',
        ])
    })
})
