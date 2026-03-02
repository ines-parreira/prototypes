import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import * as channelMetricsHooks from 'domains/reporting/hooks/ai-sales-agent/channelMetrics'
import * as shoppingAssistantChannelMetricsHooks from 'domains/reporting/hooks/ai-sales-agent/shoppingAssistantChannelMetrics'
import { AiSalesAgentConversationsDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentConversations'
import { AiSalesAgentOrdersDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { FilterKey } from 'domains/reporting/models/stat/types'

import { useShoppingAssistantChannelMetrics } from './useShoppingAssistantChannelMetrics'

jest.mock('domains/reporting/hooks/ai-sales-agent/channelMetrics')
jest.mock(
    'domains/reporting/hooks/ai-sales-agent/shoppingAssistantChannelMetrics',
)

const mockChannelMetricsHooks = channelMetricsHooks as jest.Mocked<
    typeof channelMetricsHooks
>
const mockShoppingAssistantChannelMetricsHooks =
    shoppingAssistantChannelMetricsHooks as jest.Mocked<
        typeof shoppingAssistantChannelMetricsHooks
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

describe('useShoppingAssistantChannelMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should return loading state when queries are fetching', () => {
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
        mockShoppingAssistantChannelMetricsHooks.useHandoverInteractionsFromConversationsPerChannel.mockReturnValue(
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
        mockShoppingAssistantChannelMetricsHooks.useOrdersInfluencedPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: true,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantChannelMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.loadingStates).toEqual({
            automationRate: true,
            aiAgentInteractionsShare: true,
            automatedInteractions: true,
            handover: true,
            totalSales: true,
            ordersInfluenced: true,
        })
        expect(result.current.data).toEqual([])
    })

    it('should return error state when any query fails', () => {
        mockChannelMetricsHooks.useTotalSalesConversationsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
                isError: true,
            } as any,
        )
        mockChannelMetricsHooks.useAutomatedSalesConversationsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockShoppingAssistantChannelMetricsHooks.useHandoverInteractionsFromConversationsPerChannel.mockReturnValue(
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
        mockShoppingAssistantChannelMetricsHooks.useOrdersInfluencedPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantChannelMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        expect(result.current.isError).toBe(true)
    })

    it('should aggregate data from all channels correctly', async () => {
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

        const mockHandoverData = {
            allData: [
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'chat',
                    'AiSalesAgentConversations.count': '30',
                },
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'email',
                    'AiSalesAgentConversations.count': '10',
                },
            ],
        }

        const mockGmvData = {
            allData: [
                {
                    [AiSalesAgentOrdersDimension.Channel]: 'chat',
                    'AiSalesAgentOrders.gmvUsd': '5000',
                },
                {
                    [AiSalesAgentOrdersDimension.Channel]: 'email',
                    'AiSalesAgentOrders.gmvUsd': '10000',
                },
            ],
        }

        const mockOrdersInfluenced = {
            allData: [
                {
                    [AiSalesAgentOrdersDimension.Channel]: 'chat',
                    'AiSalesAgentOrders.count': '50',
                },
                {
                    [AiSalesAgentOrdersDimension.Channel]: 'email',
                    'AiSalesAgentOrders.count': '80',
                },
            ],
        }

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
        mockShoppingAssistantChannelMetricsHooks.useHandoverInteractionsFromConversationsPerChannel.mockReturnValue(
            {
                data: mockHandoverData,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useGmvInfluencedPerChannel.mockReturnValue({
            data: mockGmvData,
            isFetching: false,
            isError: false,
        } as any)
        mockShoppingAssistantChannelMetricsHooks.useOrdersInfluencedPerChannel.mockReturnValue(
            {
                data: mockOrdersInfluenced,
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantChannelMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(2)
        })

        expect(result.current.data).toEqual([
            {
                channel: 'chat',
                automationRate: 80,
                aiAgentInteractionsShare: 60,
                automatedInteractions: 120,
                handover: 30,
                successRate: 80,
                totalSales: 5000,
                ordersInfluenced: 50,
                revenuePerInteraction: 5000 / 150,
            },
            {
                channel: 'email',
                automationRate: 90,
                aiAgentInteractionsShare: 40,
                automatedInteractions: 90,
                handover: 10,
                successRate: 90,
                totalSales: 10000,
                ordersInfluenced: 80,
                revenuePerInteraction: 10000 / 100,
            },
        ])
    })

    it('should handle channels with missing data gracefully', async () => {
        const mockTotalConversations = {
            allData: [
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'sms',
                    'AiSalesAgentConversations.count': '100',
                },
            ],
        }

        mockChannelMetricsHooks.useTotalSalesConversationsPerChannel.mockReturnValue(
            {
                data: mockTotalConversations,
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
        mockShoppingAssistantChannelMetricsHooks.useHandoverInteractionsFromConversationsPerChannel.mockReturnValue(
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
        mockShoppingAssistantChannelMetricsHooks.useOrdersInfluencedPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantChannelMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })

        expect(result.current.data[0]).toEqual({
            channel: 'sms',
            automationRate: null,
            aiAgentInteractionsShare: 100,
            automatedInteractions: null,
            handover: null,
            successRate: null,
            totalSales: null,
            ordersInfluenced: null,
            revenuePerInteraction: null,
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
        mockShoppingAssistantChannelMetricsHooks.useHandoverInteractionsFromConversationsPerChannel.mockReturnValue(
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
        mockShoppingAssistantChannelMetricsHooks.useOrdersInfluencedPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantChannelMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })

        expect(result.current.data[0].automationRate).toBe(75)
        expect(result.current.data[0].successRate).toBe(75)
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
        mockShoppingAssistantChannelMetricsHooks.useHandoverInteractionsFromConversationsPerChannel.mockReturnValue(
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
        mockShoppingAssistantChannelMetricsHooks.useOrdersInfluencedPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantChannelMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })

        expect(result.current.data[0].automationRate).toBeNull()
        expect(result.current.data[0].revenuePerInteraction).toBeNull()
    })

    it('should calculate revenue per interaction correctly', async () => {
        const mockTotalConversations = {
            allData: [
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'chat',
                    'AiSalesAgentConversations.count': '100',
                },
            ],
        }

        const mockGmvData = {
            allData: [
                {
                    [AiSalesAgentOrdersDimension.Channel]: 'chat',
                    'AiSalesAgentOrders.gmvUsd': '2500',
                },
            ],
        }

        mockChannelMetricsHooks.useTotalSalesConversationsPerChannel.mockReturnValue(
            {
                data: mockTotalConversations,
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
        mockShoppingAssistantChannelMetricsHooks.useHandoverInteractionsFromConversationsPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useGmvInfluencedPerChannel.mockReturnValue({
            data: mockGmvData,
            isFetching: false,
            isError: false,
        } as any)
        mockShoppingAssistantChannelMetricsHooks.useOrdersInfluencedPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantChannelMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })

        expect(result.current.data[0].revenuePerInteraction).toBe(25)
    })

    it('should sort channels alphabetically', async () => {
        const mockTotalConversations = {
            allData: [
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'sms',
                    'AiSalesAgentConversations.count': '10',
                },
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'chat',
                    'AiSalesAgentConversations.count': '20',
                },
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'email',
                    'AiSalesAgentConversations.count': '30',
                },
            ],
        }

        mockChannelMetricsHooks.useTotalSalesConversationsPerChannel.mockReturnValue(
            {
                data: mockTotalConversations,
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
        mockShoppingAssistantChannelMetricsHooks.useHandoverInteractionsFromConversationsPerChannel.mockReturnValue(
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
        mockShoppingAssistantChannelMetricsHooks.useOrdersInfluencedPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantChannelMetrics(mockFilters, mockTimezone),
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

    it('should calculate AI Agent interactions share correctly', async () => {
        const mockTotalConversations = {
            allData: [
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'chat',
                    'AiSalesAgentConversations.count': '150',
                },
                {
                    [AiSalesAgentConversationsDimension.Channel]: 'email',
                    'AiSalesAgentConversations.count': '50',
                },
            ],
        }

        mockChannelMetricsHooks.useTotalSalesConversationsPerChannel.mockReturnValue(
            {
                data: mockTotalConversations,
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
        mockShoppingAssistantChannelMetricsHooks.useHandoverInteractionsFromConversationsPerChannel.mockReturnValue(
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
        mockShoppingAssistantChannelMetricsHooks.useOrdersInfluencedPerChannel.mockReturnValue(
            {
                data: { allData: [] },
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () => useShoppingAssistantChannelMetrics(mockFilters, mockTimezone),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(2)
        })

        expect(result.current.data[0].aiAgentInteractionsShare).toBe(75)
        expect(result.current.data[1].aiAgentInteractionsShare).toBe(25)
    })
})
