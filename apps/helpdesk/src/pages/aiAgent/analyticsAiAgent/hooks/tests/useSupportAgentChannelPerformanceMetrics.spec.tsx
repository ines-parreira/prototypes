import type { ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import * as channelMetricsHooks from 'domains/reporting/hooks/ai-sales-agent/channelMetrics'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketCustomFieldsMeasure } from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { useSupportAgentChannelPerformanceMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentChannelPerformanceMetrics'
import * as customFieldsHooks from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

jest.mock('domains/reporting/hooks/ai-sales-agent/channelMetrics')
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)

const mockChannelMetricsHooks = channelMetricsHooks as jest.Mocked<
    typeof channelMetricsHooks
>
const mockCustomFieldsHooks = customFieldsHooks as jest.Mocked<
    typeof customFieldsHooks
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

describe('useSupportAgentChannelPerformanceMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockCustomFieldsHooks.useGetCustomTicketsFieldsDefinitionData.mockReturnValue(
            {
                outcomeCustomFieldId: 123,
                intentCustomFieldId: 456,
                isLoading: false,
                isError: false,
            } as any,
        )
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

        const { result } = renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
            { wrapper: createWrapper() },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.loadingStates).toEqual({
            handoverInteractions: true,
            snoozedInteractions: true,
        })
        expect(result.current.data).toEqual([])
    })

    it('should return loading state when only handoverInteractions is fetching', () => {
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
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
            { wrapper: createWrapper() },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.loadingStates.handoverInteractions).toBe(true)
        expect(result.current.loadingStates.snoozedInteractions).toBe(false)
    })

    it('should return loading state when only snoozedInteractions is fetching', () => {
        mockChannelMetricsHooks.useHandoverInteractionsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
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

        const { result } = renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
            { wrapper: createWrapper() },
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.loadingStates.handoverInteractions).toBe(false)
        expect(result.current.loadingStates.snoozedInteractions).toBe(true)
    })

    it('should return error state when handoverInteractions query fails', () => {
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

        const { result } = renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
            { wrapper: createWrapper() },
        )

        expect(result.current.isError).toBe(true)
    })

    it('should return error state when snoozedInteractions query fails', () => {
        mockChannelMetricsHooks.useHandoverInteractionsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useSnoozedInteractionsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
                isError: true,
            } as any,
        )

        const { result } = renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
            { wrapper: createWrapper() },
        )

        expect(result.current.isError).toBe(true)
    })

    it('should aggregate data from all channels correctly', async () => {
        const mockHandoverData = {
            allData: [
                {
                    [TicketDimension.Channel]: 'chat',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '100',
                },
                {
                    [TicketDimension.Channel]: 'email',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '50',
                },
            ],
        }

        const mockSnoozedData = {
            allData: [
                {
                    [TicketDimension.Channel]: 'chat',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '20',
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

        const { result } = renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
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
            },
            {
                channel: 'email',
                handoverInteractions: 50,
                snoozedInteractions: null,
            },
        ])
    })

    it('should handle channels with no data gracefully', async () => {
        const mockHandoverData = {
            allData: [
                {
                    [TicketDimension.Channel]: 'sms',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '10',
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

        const { result } = renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })

        expect(result.current.data[0]).toEqual({
            channel: 'sms',
            handoverInteractions: 10,
            snoozedInteractions: null,
        })
    })

    it('should sort channels alphabetically', async () => {
        const mockHandoverData = {
            allData: [
                {
                    [TicketDimension.Channel]: 'sms',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '10',
                },
                {
                    [TicketDimension.Channel]: 'chat',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '20',
                },
                {
                    [TicketDimension.Channel]: 'email',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '30',
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

        const { result } = renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
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

    it('should handle numeric counts directly without parsing', async () => {
        const mockHandoverData = {
            allData: [
                {
                    [TicketDimension.Channel]: 'chat',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 100,
                },
            ],
        }

        const mockSnoozedData = {
            allData: [
                {
                    [TicketDimension.Channel]: 'chat',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: 50,
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

        const { result } = renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })

        expect(result.current.data[0]).toEqual({
            channel: 'chat',
            handoverInteractions: 100,
            snoozedInteractions: 50,
        })
    })

    it('should merge channels from both data sources', async () => {
        const mockHandoverData = {
            allData: [
                {
                    [TicketDimension.Channel]: 'chat',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '100',
                },
            ],
        }

        const mockSnoozedData = {
            allData: [
                {
                    [TicketDimension.Channel]: 'email',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '30',
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

        const { result } = renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(2)
        })

        expect(result.current.data).toEqual([
            {
                channel: 'chat',
                handoverInteractions: 100,
                snoozedInteractions: null,
            },
            {
                channel: 'email',
                handoverInteractions: null,
                snoozedInteractions: 30,
            },
        ])
    })

    it('should handle empty data from both sources', async () => {
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

        const { result } = renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
            { wrapper: createWrapper() },
        )

        expect(result.current.data).toEqual([])
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should handle null data from hooks', async () => {
        mockChannelMetricsHooks.useHandoverInteractionsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useSnoozedInteractionsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
                isError: false,
            } as any,
        )

        const { result } = renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
            { wrapper: createWrapper() },
        )

        expect(result.current.data).toEqual([])
        expect(result.current.isLoading).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('should skip items with non-string channel values', async () => {
        const mockHandoverData = {
            allData: [
                {
                    [TicketDimension.Channel]: 'chat',
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '100',
                },
                {
                    [TicketDimension.Channel]: null,
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '50',
                },
                {
                    [TicketDimension.Channel]: 123,
                    [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]:
                        '25',
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

        const { result } = renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
            { wrapper: createWrapper() },
        )

        await waitFor(() => {
            expect(result.current.data).toHaveLength(1)
        })

        expect(result.current.data[0].channel).toBe('chat')
    })

    it('should call hooks with correct parameters', () => {
        mockChannelMetricsHooks.useHandoverInteractionsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
                isError: false,
            } as any,
        )
        mockChannelMetricsHooks.useSnoozedInteractionsPerChannel.mockReturnValue(
            {
                data: null,
                isFetching: false,
                isError: false,
            } as any,
        )

        renderHook(
            () =>
                useSupportAgentChannelPerformanceMetrics(
                    mockFilters,
                    mockTimezone,
                ),
            { wrapper: createWrapper() },
        )

        expect(
            mockChannelMetricsHooks.useHandoverInteractionsPerChannel,
        ).toHaveBeenCalledWith(mockFilters, mockTimezone, 123)
        expect(
            mockChannelMetricsHooks.useSnoozedInteractionsPerChannel,
        ).toHaveBeenCalledWith(mockFilters, mockTimezone, 123)
    })
})
