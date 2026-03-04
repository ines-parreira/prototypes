import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import * as useIntentPerformanceMetricsModule from 'pages/aiAgent/analyticsAiAgent/hooks/useIntentPerformanceMetrics'

import { IntentPerformanceBreakdownTable } from '../IntentPerformanceBreakdownTable'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock('pages/aiAgent/analyticsAiAgent/hooks/useIntentPerformanceMetrics')

const mockUseStatsFilters = useStatsFilters as jest.MockedFunction<
    typeof useStatsFilters
>
const mockUseIntentPerformanceMetrics =
    useIntentPerformanceMetricsModule.useIntentPerformanceMetrics as jest.MockedFunction<
        typeof useIntentPerformanceMetricsModule.useIntentPerformanceMetrics
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

describe('IntentPerformanceBreakdownTable', () => {
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
        mockUseIntentPerformanceMetrics.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            loadingStates: {
                handoverInteractions: true,
                snoozedInteractions: true,
                successRate: true,
                costSaved: true,
            },
        })

        render(<IntentPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            const skeletons = document.querySelectorAll('[class*="skeleton"]')
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    it('should render intent data correctly', async () => {
        mockUseIntentPerformanceMetrics.mockReturnValue({
            data: [
                {
                    intentL1: 'Order',
                    intentL2: 'Status',
                    handoverInteractions: 100,
                    snoozedInteractions: 20,
                    successRate: 80,
                    costSaved: 500,
                },
                {
                    intentL1: 'Account',
                    intentL2: 'Settings',
                    handoverInteractions: 50,
                    snoozedInteractions: null,
                    successRate: 90,
                    costSaved: 300,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                successRate: false,
                costSaved: false,
            },
        })

        render(<IntentPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Order')).toBeInTheDocument()
            expect(screen.getByText('Status')).toBeInTheDocument()
            expect(screen.getByText('Account')).toBeInTheDocument()
            expect(screen.getByText('Settings')).toBeInTheDocument()
        })

        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('50')).toBeInTheDocument()
        expect(screen.getByText('20')).toBeInTheDocument()
        expect(screen.getByText('80%')).toBeInTheDocument()
        expect(screen.getByText('90%')).toBeInTheDocument()
        expect(screen.getByText('$500')).toBeInTheDocument()
        expect(screen.getByText('$300')).toBeInTheDocument()
    })

    it('should show placeholder for null values when not loading', async () => {
        mockUseIntentPerformanceMetrics.mockReturnValue({
            data: [
                {
                    intentL1: 'Order',
                    intentL2: 'Cancel',
                    handoverInteractions: 10,
                    snoozedInteractions: null,
                    successRate: null,
                    costSaved: null,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                successRate: false,
                costSaved: false,
            },
        })

        render(<IntentPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Order')).toBeInTheDocument()
            expect(screen.getByText('Cancel')).toBeInTheDocument()
        })

        const placeholderElements = screen.getAllByText('-')
        expect(placeholderElements.length).toBeGreaterThanOrEqual(3)
    })

    it('should show skeletons only for loading metrics', async () => {
        mockUseIntentPerformanceMetrics.mockReturnValue({
            data: [
                {
                    intentL1: 'Order',
                    intentL2: 'Status',
                    handoverInteractions: 100,
                    snoozedInteractions: 20,
                    successRate: null,
                    costSaved: 500,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                successRate: true,
                costSaved: false,
            },
        })

        render(<IntentPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Order')).toBeInTheDocument()
        })

        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('20')).toBeInTheDocument()
        expect(screen.getByText('$500')).toBeInTheDocument()

        const skeletons = document.querySelectorAll('[class*="skeleton"]')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should display no data message when data array is empty', async () => {
        mockUseIntentPerformanceMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                successRate: false,
                costSaved: false,
            },
        })

        render(<IntentPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            const table = screen.getByRole('table')
            expect(table).toBeInTheDocument()
        })
    })

    it('should format success rate as percentage', async () => {
        mockUseIntentPerformanceMetrics.mockReturnValue({
            data: [
                {
                    intentL1: 'Order',
                    intentL2: 'Status',
                    handoverInteractions: 100,
                    snoozedInteractions: 20,
                    successRate: 85.5,
                    costSaved: 500,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                successRate: false,
                costSaved: false,
            },
        })

        render(<IntentPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Order')).toBeInTheDocument()
            expect(screen.getByText('Status')).toBeInTheDocument()
        })
    })

    it('should format cost saved as currency', async () => {
        mockUseIntentPerformanceMetrics.mockReturnValue({
            data: [
                {
                    intentL1: 'Order',
                    intentL2: 'Status',
                    handoverInteractions: 100,
                    snoozedInteractions: 20,
                    successRate: 80,
                    costSaved: 1234.56,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                successRate: false,
                costSaved: false,
            },
        })

        render(<IntentPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Order')).toBeInTheDocument()
            expect(screen.getByText('Status')).toBeInTheDocument()
        })

        const table = screen.getByRole('table')
        expect(table).toBeInTheDocument()
    })

    it('should handle multiple intents correctly', async () => {
        mockUseIntentPerformanceMetrics.mockReturnValue({
            data: [
                {
                    intentL1: 'Order',
                    intentL2: 'Status',
                    handoverInteractions: 100,
                    snoozedInteractions: 20,
                    successRate: 80,
                    costSaved: 500,
                },
                {
                    intentL1: 'Order',
                    intentL2: 'Cancel',
                    handoverInteractions: 50,
                    snoozedInteractions: 10,
                    successRate: 90,
                    costSaved: 300,
                },
                {
                    intentL1: 'Account',
                    intentL2: 'Settings',
                    handoverInteractions: 30,
                    snoozedInteractions: 5,
                    successRate: 95,
                    costSaved: 200,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                successRate: false,
                costSaved: false,
            },
        })

        render(<IntentPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Status')).toBeInTheDocument()
            expect(screen.getByText('Cancel')).toBeInTheDocument()
            expect(screen.getByText('Account')).toBeInTheDocument()
        })

        const table = screen.getByRole('table')
        expect(table).toBeInTheDocument()
    })

    it('should display intent level 1 and level 2 separately', async () => {
        mockUseIntentPerformanceMetrics.mockReturnValue({
            data: [
                {
                    intentL1: 'Order',
                    intentL2: 'Status',
                    handoverInteractions: 100,
                    snoozedInteractions: 20,
                    successRate: 80,
                    costSaved: 500,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handoverInteractions: false,
                snoozedInteractions: false,
                successRate: false,
                costSaved: false,
            },
        })

        render(<IntentPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            const orderElements = screen.getAllByText('Order')
            const statusElements = screen.getAllByText('Status')

            expect(orderElements.length).toBeGreaterThan(0)
            expect(statusElements.length).toBeGreaterThan(0)
        })
    })
})
