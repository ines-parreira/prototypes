import { renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useDownloadShoppingAssistantChannelData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadShoppingAssistantChannelData'
import { useShoppingAssistantChannelMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantChannelMetrics'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantChannelMetrics',
)

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseShoppingAssistantChannelMetrics = jest.mocked(
    useShoppingAssistantChannelMetrics,
)

describe('useDownloadShoppingAssistantChannelData', () => {
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
            data: undefined as any,
            isLoading: true,
            isError: false,
            loadingStates: {
                automationRate: true,
                aiAgentInteractionsShare: true,
                automatedInteractions: true,
                handover: true,
                totalSales: true,
                ordersInfluenced: true,
            },
        })

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [
                {
                    channel: 'email',
                    automationRate: 0.85,
                    aiAgentInteractionsShare: 0.5,
                    automatedInteractions: 100,
                    handover: 50,
                    successRate: 0.9,
                    totalSales: 5000,
                    ordersInfluenced: 25,
                    revenuePerInteraction: 50,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                handover: false,
                totalSales: false,
                ordersInfluenced: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelData(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty CSV when data is undefined', () => {
        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: undefined as any,
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                handover: false,
                totalSales: false,
                ordersInfluenced: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toBe('')
    })

    it('should return empty CSV when data is empty array', () => {
        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                handover: false,
                totalSales: false,
                ordersInfluenced: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toBe('')
    })

    it('should return CSV with shopping assistant channel data', () => {
        const mockChannelData = [
            {
                channel: 'email',
                automationRate: 0.85,
                aiAgentInteractionsShare: 0.5,
                automatedInteractions: 100,
                handover: 50,
                successRate: 0.9,
                totalSales: 5000,
                ordersInfluenced: 25,
                revenuePerInteraction: 50,
            },
            {
                channel: 'chat',
                automationRate: 0.75,
                aiAgentInteractionsShare: 0.6,
                automatedInteractions: 200,
                handover: 75,
                successRate: 0.85,
                totalSales: 7500,
                ordersInfluenced: 40,
                revenuePerInteraction: 37.5,
            },
        ]

        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                handover: false,
                totalSales: false,
                ordersInfluenced: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(
            fileNames.some((name) =>
                name.includes('shopping-assistant-channel-performance'),
            ),
        ).toBe(true)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Channel')
        expect(csvContent).toContain('Automation rate')
        expect(csvContent).toContain('AI Agent interactions share')
        expect(csvContent).toContain('Automated interactions')
        expect(csvContent).toContain('Handover')
        expect(csvContent).toContain('Success rate')
        expect(csvContent).toContain('Total sales')
        expect(csvContent).toContain('Orders influenced')
        expect(csvContent).toContain('Revenue per interaction')
    })

    it('should format channel names correctly', () => {
        const mockChannelData = [
            {
                channel: 'email',
                automationRate: 0.85,
                aiAgentInteractionsShare: 0.5,
                automatedInteractions: 100,
                handover: 50,
                successRate: 0.9,
                totalSales: 5000,
                ordersInfluenced: 25,
                revenuePerInteraction: 50,
            },
            {
                channel: 'chat',
                automationRate: 0.75,
                aiAgentInteractionsShare: 0.6,
                automatedInteractions: 200,
                handover: 75,
                successRate: 0.85,
                totalSales: 7500,
                ordersInfluenced: 40,
                revenuePerInteraction: 37.5,
            },
            {
                channel: 'sms',
                automationRate: 0.65,
                aiAgentInteractionsShare: 0.4,
                automatedInteractions: 50,
                handover: 25,
                successRate: 0.8,
                totalSales: 2500,
                ordersInfluenced: 10,
                revenuePerInteraction: 50,
            },
            {
                channel: 'contact-form',
                automationRate: 0.7,
                aiAgentInteractionsShare: 0.3,
                automatedInteractions: 30,
                handover: 10,
                successRate: 0.75,
                totalSales: 1500,
                ordersInfluenced: 5,
                revenuePerInteraction: 50,
            },
            {
                channel: 'help-center',
                automationRate: 0.95,
                aiAgentInteractionsShare: 0.7,
                automatedInteractions: 20,
                handover: 5,
                successRate: 0.95,
                totalSales: 1000,
                ordersInfluenced: 3,
                revenuePerInteraction: 50,
            },
            {
                channel: 'voice',
                automationRate: 0.5,
                aiAgentInteractionsShare: 0.2,
                automatedInteractions: 15,
                handover: 8,
                successRate: 0.6,
                totalSales: 750,
                ordersInfluenced: 2,
                revenuePerInteraction: 50,
            },
        ]

        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                handover: false,
                totalSales: false,
                ordersInfluenced: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelData(),
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
                aiAgentInteractionsShare: 0.5,
                automatedInteractions: 100,
                handover: 50,
                successRate: 0.9,
                totalSales: 5000,
                ordersInfluenced: 25,
                revenuePerInteraction: 50,
            },
        ]

        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                handover: false,
                totalSales: false,
                ordersInfluenced: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('custom-channel')
    })

    it('should include fileName in return value', () => {
        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [
                {
                    channel: 'email',
                    automationRate: 0.85,
                    aiAgentInteractionsShare: 0.5,
                    automatedInteractions: 100,
                    handover: 50,
                    successRate: 0.9,
                    totalSales: 5000,
                    ordersInfluenced: 25,
                    revenuePerInteraction: 50,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                handover: false,
                totalSales: false,
                ordersInfluenced: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadShoppingAssistantChannelData(),
        )

        expect(result.current.fileName).toContain(
            'shopping-assistant-channel-performance',
        )
        expect(result.current.fileName).toContain('.csv')
    })

    it('should call useShoppingAssistantChannelMetrics with correct params', () => {
        mockedUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: undefined as any,
            isLoading: false,
            isError: false,
            loadingStates: {
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                handover: false,
                totalSales: false,
                ordersInfluenced: false,
            },
        })

        renderHook(() => useDownloadShoppingAssistantChannelData())

        expect(mockedUseShoppingAssistantChannelMetrics).toHaveBeenCalledWith(
            { period: mockPeriod },
            'UTC',
        )
    })
})
