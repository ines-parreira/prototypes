import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useDownloadSupportAgentChannelPerformanceData } from 'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentChannelPerformanceData'
import * as useSupportAgentChannelPerformanceMetricsModule from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentChannelPerformanceMetrics'

import { SupportAgentChannelPerformanceBreakdownTable } from './SupportAgentChannelPerformanceBreakdownTable'

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentChannelPerformanceMetrics',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useDownloadSupportAgentChannelPerformanceData',
)

const mockUseAutomateFilters = useAutomateFilters as jest.MockedFunction<
    typeof useAutomateFilters
>
const mockUseSupportAgentChannelPerformanceMetrics =
    useSupportAgentChannelPerformanceMetricsModule.useSupportAgentChannelPerformanceMetrics as jest.MockedFunction<
        typeof useSupportAgentChannelPerformanceMetricsModule.useSupportAgentChannelPerformanceMetrics
    >
const mockUseDownloadSupportAgentChannelPerformanceData =
    useDownloadSupportAgentChannelPerformanceData as jest.MockedFunction<
        typeof useDownloadSupportAgentChannelPerformanceData
    >

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

describe('SupportAgentChannelPerformanceBreakdownTable', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAutomateFilters.mockReturnValue({
            statsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            userTimezone: 'UTC',
        } as any)

        mockUseDownloadSupportAgentChannelPerformanceData.mockReturnValue({
            files: [],
            fileName: 'support-agent-channel-performance.csv',
            isLoading: false,
        } as any)
    })

    it('should render loading skeletons when data is loading', async () => {
        mockUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            loadingStates: {
                handoverInteractions: true,
                snoozedInteractions: true,
            },
        })

        render(<SupportAgentChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            const skeletons = document.querySelectorAll('[class*="skeleton"]')
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    it('should render channel data correctly', async () => {
        mockUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: [
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
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        render(<SupportAgentChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Chat')).toBeInTheDocument()
            expect(screen.getByText('Email')).toBeInTheDocument()
        })

        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('50')).toBeInTheDocument()
        expect(screen.getByText('20')).toBeInTheDocument()
    })

    it('should show placeholder for null values when not loading', async () => {
        mockUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'sms',
                    handoverInteractions: 10,
                    snoozedInteractions: null,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        render(<SupportAgentChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('SMS')).toBeInTheDocument()
        })

        const placeholderElements = screen.getAllByText('-')
        expect(placeholderElements.length).toBeGreaterThanOrEqual(1)
    })

    it('should show skeletons only for loading metrics', async () => {
        mockUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    handoverInteractions: 100,
                    snoozedInteractions: null,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: true,
            },
        })

        render(<SupportAgentChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Chat')).toBeInTheDocument()
        })

        expect(screen.getByText('100')).toBeInTheDocument()

        const skeletons = document.querySelectorAll('[class*="skeleton"]')
        expect(skeletons.length).toBe(1)
    })

    it('should format channel names correctly', async () => {
        mockUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'contact-form',
                    handoverInteractions: 10,
                    snoozedInteractions: 5,
                },
                {
                    channel: 'help-center',
                    handoverInteractions: 15,
                    snoozedInteractions: 3,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        render(<SupportAgentChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Contact Form')).toBeInTheDocument()
            expect(screen.getByText('Help Center')).toBeInTheDocument()
        })
    })

    it('should render table headers', async () => {
        mockUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    handoverInteractions: 100,
                    snoozedInteractions: 20,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        render(<SupportAgentChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Channel')).toBeInTheDocument()
        })

        expect(screen.getByText('Handover interactions')).toBeInTheDocument()
        expect(screen.getByText('Snoozed interactions')).toBeInTheDocument()
    })

    it('should display empty state when no channels are returned', async () => {
        mockUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        render(<SupportAgentChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('No data found')).toBeInTheDocument()
        })

        expect(
            screen.getByText('Try to adjust your report filters.'),
        ).toBeInTheDocument()
    })

    it('should display empty state when data has only zero or null metrics', async () => {
        mockUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    handoverInteractions: null,
                    snoozedInteractions: null,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        render(<SupportAgentChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('No data found')).toBeInTheDocument()
        })
    })

    it('should show table toolbar with settings', async () => {
        mockUseSupportAgentChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    handoverInteractions: 100,
                    snoozedInteractions: 20,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
            },
        })

        render(<SupportAgentChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            const toolbar = document.querySelector(
                '[data-name="table-toolbar"]',
            )
            expect(toolbar).toBeInTheDocument()
        })
    })
})
