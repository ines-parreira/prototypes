import { renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useChannelPerformanceMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useChannelPerformanceMetrics'
import { useDownloadChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadChannelPerformanceData'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useChannelPerformanceMetrics')

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseChannelPerformanceMetrics = jest.mocked(
    useChannelPerformanceMetrics,
)

describe('useDownloadChannelPerformanceData', () => {
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
        mockedUseChannelPerformanceMetrics.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            loadingStates: {
                handoverInteractions: true,
                snoozedInteractions: true,
                totalSales: true,
                automationRate: true,
            },
        })

        const { result } = renderHook(() => useDownloadChannelPerformanceData())

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'email',
                    handoverInteractions: 100,
                    snoozedInteractions: 50,
                    totalSales: 5000,
                    automationRate: 0.85,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                totalSales: false,
                automationRate: false,
            },
        })

        const { result } = renderHook(() => useDownloadChannelPerformanceData())

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty CSV when data is empty array', () => {
        mockedUseChannelPerformanceMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                totalSales: false,
                automationRate: false,
            },
        })

        const { result } = renderHook(() => useDownloadChannelPerformanceData())

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toBe('')
    })

    it('should return CSV with channel performance data', () => {
        const mockChannelData = [
            {
                channel: 'email',
                handoverInteractions: 100,
                snoozedInteractions: 50,
                totalSales: 5000,
                automationRate: 0.85,
            },
            {
                channel: 'chat',
                handoverInteractions: 200,
                snoozedInteractions: 75,
                totalSales: 7500,
                automationRate: 0.9,
            },
        ]

        mockedUseChannelPerformanceMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                totalSales: false,
                automationRate: false,
            },
        })

        const { result } = renderHook(() => useDownloadChannelPerformanceData())

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(
            fileNames.some((name) =>
                name.includes('ai-agent-channel-performance'),
            ),
        ).toBe(true)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Channel')
        expect(csvContent).toContain('Handover interactions')
        expect(csvContent).toContain('Snoozed interactions')
        expect(csvContent).toContain('Total sales')
        expect(csvContent).toContain('% automated by Shopping assistant')
    })

    it('should format channel names correctly', () => {
        const mockChannelData = [
            {
                channel: 'email',
                handoverInteractions: 100,
                snoozedInteractions: 50,
                totalSales: 5000,
                automationRate: 0.85,
            },
            {
                channel: 'chat',
                handoverInteractions: 200,
                snoozedInteractions: 75,
                totalSales: 7500,
                automationRate: 0.9,
            },
            {
                channel: 'sms',
                handoverInteractions: 50,
                snoozedInteractions: 25,
                totalSales: 2500,
                automationRate: 0.8,
            },
            {
                channel: 'contact-form',
                handoverInteractions: 30,
                snoozedInteractions: 10,
                totalSales: 1500,
                automationRate: 0.75,
            },
            {
                channel: 'contact_form',
                handoverInteractions: 30,
                snoozedInteractions: 10,
                totalSales: 1500,
                automationRate: 0.75,
            },
            {
                channel: 'help-center',
                handoverInteractions: 20,
                snoozedInteractions: 5,
                totalSales: 1000,
                automationRate: 0.95,
            },
            {
                channel: 'voice',
                handoverInteractions: 15,
                snoozedInteractions: 8,
                totalSales: 750,
                automationRate: 0.6,
            },
        ]

        mockedUseChannelPerformanceMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                totalSales: false,
                automationRate: false,
            },
        })

        const { result } = renderHook(() => useDownloadChannelPerformanceData())

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
                handoverInteractions: 100,
                snoozedInteractions: 50,
                totalSales: 5000,
                automationRate: 0.85,
            },
        ]

        mockedUseChannelPerformanceMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                totalSales: false,
                automationRate: false,
            },
        })

        const { result } = renderHook(() => useDownloadChannelPerformanceData())

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('custom-channel')
    })

    it('should include fileName in return value', () => {
        mockedUseChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'email',
                    handoverInteractions: 100,
                    snoozedInteractions: 50,
                    totalSales: 5000,
                    automationRate: 0.85,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                totalSales: false,
                automationRate: false,
            },
        })

        const { result } = renderHook(() => useDownloadChannelPerformanceData())

        expect(result.current.fileName).toContain(
            'ai-agent-channel-performance',
        )
        expect(result.current.fileName).toContain('.csv')
    })

    it('should call useChannelPerformanceMetrics with correct params', () => {
        mockedUseChannelPerformanceMetrics.mockReturnValue({
            data: undefined as any,
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                totalSales: false,
                automationRate: false,
            },
        })

        renderHook(() => useDownloadChannelPerformanceData())

        expect(mockedUseChannelPerformanceMetrics).toHaveBeenCalledWith(
            { period: mockPeriod },
            'UTC',
        )
    })
})
