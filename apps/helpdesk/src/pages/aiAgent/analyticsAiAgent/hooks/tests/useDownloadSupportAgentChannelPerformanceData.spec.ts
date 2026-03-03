import { renderHook } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useDownloadSupportAgentChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentChannelPerformanceData'
import { useSupportAgentChannelPerformanceMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentChannelPerformanceMetrics'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentChannelPerformanceMetrics',
)

const mockedUseStatsFilters = jest.mocked(useStatsFilters)
const mockedUseSupportAgentChannelPerformanceMetrics = jest.mocked(
    useSupportAgentChannelPerformanceMetrics,
)

describe('useDownloadSupportAgentChannelPerformanceData', () => {
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
        mockedUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: undefined as any,
            isLoading: true,
            isError: false,
            loadingStates: {
                handoverInteractions: true,
                snoozedInteractions: true,
            },
        })

        const { result } = renderHook(() =>
            useDownloadSupportAgentChannelPerformanceData(),
        )

        expect(result.current.isLoading).toBe(true)
    })

    it('should return isLoading as false when data is loaded', () => {
        mockedUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'email',
                    handoverInteractions: 100,
                    snoozedInteractions: 50,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadSupportAgentChannelPerformanceData(),
        )

        expect(result.current.isLoading).toBe(false)
    })

    it('should return empty CSV when data is undefined', () => {
        mockedUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: undefined as any,
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadSupportAgentChannelPerformanceData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toBe('')
    })

    it('should return empty CSV when data is empty array', () => {
        mockedUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadSupportAgentChannelPerformanceData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toBe('')
    })

    it('should return CSV file with channel performance data', () => {
        const mockChannelData = [
            {
                channel: 'email',
                handoverInteractions: 100,
                snoozedInteractions: 50,
            },
            {
                channel: 'chat',
                handoverInteractions: 200,
                snoozedInteractions: 75,
            },
            {
                channel: 'sms',
                handoverInteractions: 50,
                snoozedInteractions: 25,
            },
        ]

        mockedUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadSupportAgentChannelPerformanceData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(
            fileNames.some((name) =>
                name.includes('support-agent-channel-performance'),
            ),
        ).toBe(true)

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('Channel')
        expect(csvContent).toContain('Handover interactions')
        expect(csvContent).toContain('Snoozed interactions')
    })

    it('should format channel names correctly', () => {
        const mockChannelData = [
            {
                channel: 'email',
                handoverInteractions: 100,
                snoozedInteractions: 50,
            },
            {
                channel: 'chat',
                handoverInteractions: 200,
                snoozedInteractions: 75,
            },
            {
                channel: 'sms',
                handoverInteractions: 50,
                snoozedInteractions: 25,
            },
            {
                channel: 'contact-form',
                handoverInteractions: 30,
                snoozedInteractions: 10,
            },
            {
                channel: 'contact_form',
                handoverInteractions: 30,
                snoozedInteractions: 10,
            },
            {
                channel: 'help-center',
                handoverInteractions: 20,
                snoozedInteractions: 5,
            },
            {
                channel: 'voice',
                handoverInteractions: 15,
                snoozedInteractions: 8,
            },
        ]

        mockedUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadSupportAgentChannelPerformanceData(),
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
                handoverInteractions: 100,
                snoozedInteractions: 50,
            },
        ]

        mockedUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadSupportAgentChannelPerformanceData(),
        )

        const csvContent = Object.values(result.current.files)[0]
        expect(csvContent).toContain('custom-channel')
    })

    it('should include date range in filename', () => {
        const mockChannelData = [
            {
                channel: 'email',
                handoverInteractions: 100,
                snoozedInteractions: 50,
            },
        ]

        mockedUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: mockChannelData,
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        const { result } = renderHook(() =>
            useDownloadSupportAgentChannelPerformanceData(),
        )

        const fileNames = Object.keys(result.current.files)
        expect(fileNames.length).toBe(1)
        expect(fileNames[0]).toContain('support-agent-channel-performance')
        expect(fileNames[0]).toContain('.csv')
    })

    it('should call useSupportAgentChannelPerformanceMetrics with correct params', () => {
        mockedUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: undefined as any,
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        renderHook(() => useDownloadSupportAgentChannelPerformanceData())

        expect(
            mockedUseSupportAgentChannelPerformanceMetrics,
        ).toHaveBeenCalledWith({ period: mockPeriod }, 'UTC')
    })
})
