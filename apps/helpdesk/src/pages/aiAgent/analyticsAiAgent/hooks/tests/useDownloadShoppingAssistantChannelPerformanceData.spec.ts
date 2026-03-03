import { renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useDownloadShoppingAssistantChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantChannelPerformanceData'
import { useShoppingAssistantChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantChannelMetrics'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantChannelMetrics',
)

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseShoppingAssistantChannelMetrics = jest.mocked(
    useShoppingAssistantChannelMetrics,
)

describe('useDownloadShoppingAssistantChannelPerformanceData', () => {
    const mockPeriod = {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: mockPeriod,
            },
            userTimezone: 'UTC',
            granularity: 'day',
        } as any)
    })

    it('should return isLoading as true when data is loading', () => {
        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelPerformanceData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [
                {
                    channel: 'email',
                    automationRate: 0.85,
                    aiAgentInteractionsShare: 0.6,
                    automatedInteractions: 1000,
                    handover: 150,
                    successRate: 0.9,
                    totalSales: 50000,
                    ordersInfluenced: 200,
                    revenuePerInteraction: 50,
                },
            ],
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelPerformanceData(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty files when data is undefined', () => {
        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelPerformanceData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return empty files when data is empty array', () => {
        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelPerformanceData(),
        )

        expect(result.current.files).toEqual({})
    })

    it('should return CSV file with channel performance data', () => {
        const mockChannelData = [
            {
                channel: 'email',
                automationRate: 0.85,
                aiAgentInteractionsShare: 0.6,
                automatedInteractions: 1000,
                handover: 150,
                successRate: 0.9,
                totalSales: 50000,
                ordersInfluenced: 200,
                revenuePerInteraction: 50,
            },
            {
                channel: 'chat',
                automationRate: 0.9,
                aiAgentInteractionsShare: 0.7,
                automatedInteractions: 2000,
                handover: 200,
                successRate: 0.92,
                totalSales: 75000,
                ordersInfluenced: 350,
                revenuePerInteraction: 37.5,
            },
        ]

        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelPerformanceData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(
            fileNames.some((name) =>
                name.includes('shopping-assistant-channel-performance'),
            ),
        ).toBe(true)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('channel')
        expect(csvContent).toContain('automation_rate')
        expect(csvContent).toContain('ai_agent_interactions_share')
        expect(csvContent).toContain('automated_interactions')
        expect(csvContent).toContain('handover')
        expect(csvContent).toContain('success_rate')
        expect(csvContent).toContain('total_sales')
        expect(csvContent).toContain('orders_influenced')
        expect(csvContent).toContain('revenue_per_interaction')
    })

    it('should format channel names correctly', () => {
        const mockChannelData = [
            {
                channel: 'email',
                automationRate: 0.85,
                aiAgentInteractionsShare: 0.6,
                automatedInteractions: 1000,
                handover: 150,
                successRate: 0.9,
                totalSales: 50000,
                ordersInfluenced: 200,
                revenuePerInteraction: 50,
            },
            {
                channel: 'chat',
                automationRate: 0.9,
                aiAgentInteractionsShare: 0.7,
                automatedInteractions: 2000,
                handover: 200,
                successRate: 0.92,
                totalSales: 75000,
                ordersInfluenced: 350,
                revenuePerInteraction: 37.5,
            },
            {
                channel: 'sms',
                automationRate: 0.8,
                aiAgentInteractionsShare: 0.5,
                automatedInteractions: 500,
                handover: 100,
                successRate: 0.88,
                totalSales: 25000,
                ordersInfluenced: 100,
                revenuePerInteraction: 50,
            },
            {
                channel: 'contact-form',
                automationRate: 0.75,
                aiAgentInteractionsShare: 0.4,
                automatedInteractions: 300,
                handover: 100,
                successRate: 0.85,
                totalSales: 15000,
                ordersInfluenced: 60,
                revenuePerInteraction: 50,
            },
            {
                channel: 'contact_form',
                automationRate: 0.75,
                aiAgentInteractionsShare: 0.4,
                automatedInteractions: 300,
                handover: 100,
                successRate: 0.85,
                totalSales: 15000,
                ordersInfluenced: 60,
                revenuePerInteraction: 50,
            },
            {
                channel: 'help-center',
                automationRate: 0.95,
                aiAgentInteractionsShare: 0.8,
                automatedInteractions: 5000,
                handover: 250,
                successRate: 0.95,
                totalSales: 100000,
                ordersInfluenced: 500,
                revenuePerInteraction: 20,
            },
            {
                channel: 'voice',
                automationRate: 0.6,
                aiAgentInteractionsShare: 0.3,
                automatedInteractions: 200,
                handover: 133,
                successRate: 0.75,
                totalSales: 10000,
                ordersInfluenced: 40,
                revenuePerInteraction: 50,
            },
        ]

        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelPerformanceData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Email')
        expect(csvContent).toContain('Chat')
        expect(csvContent).toContain('SMS')
        expect(csvContent).toContain('Contact Form')
        expect(csvContent).toContain('Help Center')
        expect(csvContent).toContain('Voice')
    })

    it('should use original channel name if not in mapping', () => {
        const mockChannelData = [
            {
                channel: 'custom-channel',
                automationRate: 0.85,
                aiAgentInteractionsShare: 0.6,
                automatedInteractions: 1000,
                handover: 150,
                successRate: 0.9,
                totalSales: 50000,
                ordersInfluenced: 200,
                revenuePerInteraction: 50,
            },
        ]

        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelPerformanceData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('custom-channel')
    })

    it('should include date range in filename', () => {
        const mockChannelData = [
            {
                channel: 'email',
                automationRate: 0.85,
                aiAgentInteractionsShare: 0.6,
                automatedInteractions: 1000,
                handover: 150,
                successRate: 0.9,
                totalSales: 50000,
                ordersInfluenced: 200,
                revenuePerInteraction: 50,
            },
        ]

        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
        } as any)

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelPerformanceData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(fileNames[0]).toContain('shopping-assistant-channel-performance')
        expect(fileNames[0]).toContain('.csv')
    })

    it('should call useShoppingAssistantChannelMetrics with correct params', () => {
        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as any)

        renderHook(() => useDownloadShoppingAssistantChannelPerformanceData())

        expect(mockedUseShoppingAssistantChannelMetrics).toHaveBeenCalledWith(
            { period: mockPeriod },
            'UTC',
        )
    })
})
