import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import * as useChannelPerformanceMetricsModule from 'pages/aiAgent/analyticsAiAgent/hooks/useChannelPerformanceMetrics'

import { ChannelPerformanceBreakdownTable } from '../ChannelPerformanceBreakdownTable'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useChannelPerformanceMetrics')

const mockUseStatsFilters = useStatsFilters as jest.MockedFunction<
    typeof useStatsFilters
>
const mockUseChannelPerformanceMetrics =
    useChannelPerformanceMetricsModule.useChannelPerformanceMetrics as jest.MockedFunction<
        typeof useChannelPerformanceMetricsModule.useChannelPerformanceMetrics
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

describe('ChannelPerformanceBreakdownTable', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            userTimezone: 'UTC',
        } as any)
    })

    it('should render loading skeletons when data is loading', async () => {
        mockUseChannelPerformanceMetrics.mockReturnValue({
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

        render(<ChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            const skeletons = document.querySelectorAll('[class*="skeleton"]')
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    it('should render channel data correctly', async () => {
        mockUseChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    handoverInteractions: 100,
                    snoozedInteractions: 20,
                    totalSales: 5000,
                    automationRate: 80,
                },
                {
                    channel: 'email',
                    handoverInteractions: 50,
                    snoozedInteractions: null,
                    totalSales: null,
                    automationRate: 90,
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

        render(<ChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Chat')).toBeInTheDocument()
            expect(screen.getByText('Email')).toBeInTheDocument()
        })

        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('50')).toBeInTheDocument()
        expect(screen.getByText('20')).toBeInTheDocument()
        expect(screen.getByText('$5,000')).toBeInTheDocument()
        expect(screen.getByText('80%')).toBeInTheDocument()
        expect(screen.getByText('90%')).toBeInTheDocument()
    })

    it('should show placeholder for null values when not loading', async () => {
        mockUseChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'sms',
                    handoverInteractions: 10,
                    snoozedInteractions: null,
                    totalSales: null,
                    automationRate: null,
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

        render(<ChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('SMS')).toBeInTheDocument()
        })

        const placeholderElements = screen.getAllByText('-')
        expect(placeholderElements.length).toBeGreaterThanOrEqual(3)
    })

    it('should show skeletons only for loading metrics', async () => {
        mockUseChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    handoverInteractions: 100,
                    snoozedInteractions: null,
                    totalSales: null,
                    automationRate: 80,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: true,
                totalSales: true,
                automationRate: false,
            },
        })

        render(<ChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Chat')).toBeInTheDocument()
        })

        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('80%')).toBeInTheDocument()

        const skeletons = document.querySelectorAll('[class*="skeleton"]')
        expect(skeletons.length).toBe(2)
    })

    it('should format channel names correctly', async () => {
        mockUseChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'contact-form',
                    handoverInteractions: 10,
                    snoozedInteractions: 5,
                    totalSales: 1000,
                    automationRate: 50,
                },
                {
                    channel: 'help-center',
                    handoverInteractions: 15,
                    snoozedInteractions: 3,
                    totalSales: 2000,
                    automationRate: 70,
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

        render(<ChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Contact Form')).toBeInTheDocument()
            expect(screen.getByText('Help Center')).toBeInTheDocument()
        })
    })

    it('should render table headers with tooltips', async () => {
        mockUseChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    handoverInteractions: 100,
                    snoozedInteractions: 20,
                    totalSales: 5000,
                    automationRate: 80,
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

        render(<ChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Channel')).toBeInTheDocument()
        })

        expect(screen.getByText('Handover interactions')).toBeInTheDocument()
        expect(screen.getByText('Snoozed interactions')).toBeInTheDocument()
        expect(screen.getByText('Total sales')).toBeInTheDocument()
        expect(
            screen.getByText('% automated by Shopping assistant'),
        ).toBeInTheDocument()
    })

    it('should display empty state when no channels are returned', async () => {
        mockUseChannelPerformanceMetrics.mockReturnValue({
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

        render(<ChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('No data found')).toBeInTheDocument()
        })

        expect(
            screen.getByText('Try to adjust your report filters.'),
        ).toBeInTheDocument()
    })

    it('should show table toolbar with settings', async () => {
        mockUseChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    handoverInteractions: 100,
                    snoozedInteractions: 20,
                    totalSales: 5000,
                    automationRate: 80,
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

        render(<ChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            const toolbar = document.querySelector(
                '[data-name="table-toolbar"]',
            )
            expect(toolbar).toBeInTheDocument()
        })
    })

    it('should update when loading states change', async () => {
        const { rerender } = render(<ChannelPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        mockUseChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    handoverInteractions: null,
                    snoozedInteractions: null,
                    totalSales: null,
                    automationRate: null,
                },
            ],
            isLoading: true,
            isError: false,
            loadingStates: {
                handoverInteractions: true,
                snoozedInteractions: true,
                totalSales: true,
                automationRate: true,
            },
        })

        rerender(<ChannelPerformanceBreakdownTable />)

        await waitFor(() => {
            const skeletons = document.querySelectorAll('[class*="skeleton"]')
            expect(skeletons.length).toBeGreaterThan(0)
        })

        mockUseChannelPerformanceMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    handoverInteractions: 100,
                    snoozedInteractions: 20,
                    totalSales: 5000,
                    automationRate: 80,
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

        await act(async () => {
            rerender(<ChannelPerformanceBreakdownTable />)
        })

        await waitFor(() => {
            expect(screen.getByText('100')).toBeInTheDocument()
        })
    })
})
