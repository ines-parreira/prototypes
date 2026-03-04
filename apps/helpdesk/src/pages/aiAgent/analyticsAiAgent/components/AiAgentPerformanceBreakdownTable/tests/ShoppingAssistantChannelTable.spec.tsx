import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import moment from 'moment/moment'
import { Provider } from 'react-redux'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { initialState as uiFiltersInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import * as useShoppingAssistantChannelMetricsModule from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantChannelMetrics'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

import { ShoppingAssistantChannelTable } from '../ShoppingAssistantChannelTable'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantChannelMetrics',
)

const mockUseStatsFilters = useStatsFilters as jest.MockedFunction<
    typeof useStatsFilters
>
const mockUseShoppingAssistantChannelMetrics =
    useShoppingAssistantChannelMetricsModule.useShoppingAssistantChannelMetrics as jest.MockedFunction<
        typeof useShoppingAssistantChannelMetricsModule.useShoppingAssistantChannelMetrics
    >

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })
    const defaultState = {
        stats: {
            filters: {
                period: {
                    end_datetime: moment().toISOString(),
                    start_datetime: moment().toISOString(),
                },
            },
        },
        ui: {
            stats: { filters: uiFiltersInitialState },
        },
    } as RootState

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <Provider store={mockStore(defaultState)}>{children}</Provider>
        </QueryClientProvider>
    )
}

describe('ShoppingAssistantChannelTable', () => {
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
        mockUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            loadingStates: {
                handover: true,
                totalSales: true,
                automationRate: true,
                aiAgentInteractionsShare: true,
                automatedInteractions: true,
                ordersInfluenced: true,
            },
        })

        render(<ShoppingAssistantChannelTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            const skeletons = document.querySelectorAll('[class*="skeleton"]')
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })

    it('should render channel data correctly', async () => {
        mockUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    automationRate: 80.5,
                    aiAgentInteractionsShare: 45.2,
                    automatedInteractions: 100,
                    handover: 20,
                    successRate: 80.5,
                    totalSales: 5000,
                    ordersInfluenced: 50,
                    revenuePerInteraction: 50,
                },
                {
                    channel: 'email',
                    automationRate: 90.3,
                    aiAgentInteractionsShare: 54.8,
                    automatedInteractions: 200,
                    handover: 10,
                    successRate: 90.3,
                    totalSales: 10000,
                    ordersInfluenced: 80,
                    revenuePerInteraction: 125,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handover: false,
                totalSales: false,
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                ordersInfluenced: false,
            },
        })

        render(<ShoppingAssistantChannelTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Chat')).toBeInTheDocument()
            expect(screen.getByText('Email')).toBeInTheDocument()
        })

        expect(screen.getByText('100')).toBeInTheDocument()
        expect(screen.getByText('200')).toBeInTheDocument()
        expect(screen.getByText('20')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument()
        expect(screen.getByText('$5,000')).toBeInTheDocument()
        expect(screen.getByText('$10,000')).toBeInTheDocument()
        const firstPercentages = screen.getAllByText('80.5%')
        expect(firstPercentages.length).toBe(2)
        const secondPercentages = screen.getAllByText('90.3%')
        expect(secondPercentages.length).toBe(2)
    })

    it('should show empty state when all metrics are zero', async () => {
        mockUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [
                {
                    channel: 'sms',
                    automationRate: 0,
                    aiAgentInteractionsShare: 0,
                    automatedInteractions: 0,
                    handover: 0,
                    successRate: 0,
                    totalSales: 0,
                    ordersInfluenced: 0,
                    revenuePerInteraction: 0,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handover: false,
                totalSales: false,
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                ordersInfluenced: false,
            },
        })

        render(<ShoppingAssistantChannelTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('No data found')).toBeInTheDocument()
        })

        expect(
            screen.getByText('Try to adjust your report filters.'),
        ).toBeInTheDocument()
    })

    it('should show skeletons only for loading metrics', async () => {
        mockUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    automationRate: 80,
                    aiAgentInteractionsShare: null,
                    automatedInteractions: 100,
                    handover: null,
                    successRate: 80,
                    totalSales: null,
                    ordersInfluenced: null,
                    revenuePerInteraction: null,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handover: true,
                totalSales: true,
                automationRate: false,
                aiAgentInteractionsShare: true,
                automatedInteractions: false,
                ordersInfluenced: true,
            },
        })

        render(<ShoppingAssistantChannelTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Chat')).toBeInTheDocument()
        })

        expect(screen.getByText('100')).toBeInTheDocument()
        const percentageElements = screen.getAllByText('80%')
        expect(percentageElements.length).toBe(2)

        const skeletons = document.querySelectorAll('[class*="skeleton"]')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should format channel names correctly', async () => {
        mockUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [
                {
                    channel: 'contact-form',
                    automationRate: 50,
                    aiAgentInteractionsShare: 20,
                    automatedInteractions: 10,
                    handover: 5,
                    successRate: 50,
                    totalSales: 1000,
                    ordersInfluenced: 10,
                    revenuePerInteraction: 100,
                },
                {
                    channel: 'help-center',
                    automationRate: 70,
                    aiAgentInteractionsShare: 30,
                    automatedInteractions: 15,
                    handover: 3,
                    successRate: 70,
                    totalSales: 2000,
                    ordersInfluenced: 20,
                    revenuePerInteraction: 133.33,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handover: false,
                totalSales: false,
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                ordersInfluenced: false,
            },
        })

        render(<ShoppingAssistantChannelTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Contact Form')).toBeInTheDocument()
            expect(screen.getByText('Help Center')).toBeInTheDocument()
        })
    })

    it('should render table headers with tooltips', async () => {
        mockUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    automationRate: 80,
                    aiAgentInteractionsShare: 45,
                    automatedInteractions: 100,
                    handover: 20,
                    successRate: 80,
                    totalSales: 5000,
                    ordersInfluenced: 50,
                    revenuePerInteraction: 50,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handover: false,
                totalSales: false,
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                ordersInfluenced: false,
            },
        })

        render(<ShoppingAssistantChannelTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Channel')).toBeInTheDocument()
        })

        expect(screen.getByText('Automation rate')).toBeInTheDocument()
        expect(
            screen.getByText('AI Agent interactions share'),
        ).toBeInTheDocument()
        expect(screen.getByText('Automated interactions')).toBeInTheDocument()
        expect(screen.getByText('Handover')).toBeInTheDocument()
        expect(screen.getByText('Success rate')).toBeInTheDocument()
        expect(screen.getByText('Total sales')).toBeInTheDocument()
        expect(screen.getByText('Orders influenced')).toBeInTheDocument()
        expect(screen.getByText('Revenue per interaction')).toBeInTheDocument()
    })

    it('should display empty state when no channels are returned', async () => {
        mockUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            loadingStates: {
                handover: false,
                totalSales: false,
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                ordersInfluenced: false,
            },
        })

        render(<ShoppingAssistantChannelTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('No data found')).toBeInTheDocument()
        })

        expect(
            screen.getByText('Try to adjust your report filters.'),
        ).toBeInTheDocument()
    })

    it('should show table toolbar with total count', async () => {
        mockUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    automationRate: 80,
                    aiAgentInteractionsShare: 45,
                    automatedInteractions: 100,
                    handover: 20,
                    successRate: 80,
                    totalSales: 5000,
                    ordersInfluenced: 50,
                    revenuePerInteraction: 50,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handover: false,
                totalSales: false,
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                ordersInfluenced: false,
            },
        })

        render(<ShoppingAssistantChannelTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('1 item')).toBeInTheDocument()
        })
    })

    it('should render all info icons for column headers', async () => {
        mockUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    automationRate: 80,
                    aiAgentInteractionsShare: 45,
                    automatedInteractions: 100,
                    handover: 20,
                    successRate: 80,
                    totalSales: 5000,
                    ordersInfluenced: 50,
                    revenuePerInteraction: 50,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handover: false,
                totalSales: false,
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                ordersInfluenced: false,
            },
        })

        const { container } = render(<ShoppingAssistantChannelTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            const infoIcons = container.querySelectorAll('[aria-label="info"]')
            expect(infoIcons.length).toBeGreaterThan(0)
        })
    })

    it('should format currency values correctly', async () => {
        mockUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    automationRate: 80,
                    aiAgentInteractionsShare: 45,
                    automatedInteractions: 100,
                    handover: 20,
                    successRate: 80,
                    totalSales: 12345.67,
                    ordersInfluenced: 50,
                    revenuePerInteraction: 246.91,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handover: false,
                totalSales: false,
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                ordersInfluenced: false,
            },
        })

        render(<ShoppingAssistantChannelTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Chat')).toBeInTheDocument()
        })

        expect(screen.getByText('$12,345.67')).toBeInTheDocument()
        expect(screen.getByText('$246.91')).toBeInTheDocument()
    })

    it('should format percentage values correctly', async () => {
        mockUseShoppingAssistantChannelMetrics.mockReturnValue({
            data: [
                {
                    channel: 'chat',
                    automationRate: 85.567,
                    aiAgentInteractionsShare: 45.123,
                    automatedInteractions: 100,
                    handover: 20,
                    successRate: 85.567,
                    totalSales: 5000,
                    ordersInfluenced: 50,
                    revenuePerInteraction: 50,
                },
            ],
            isLoading: false,
            isError: false,
            loadingStates: {
                handover: false,
                totalSales: false,
                automationRate: false,
                aiAgentInteractionsShare: false,
                automatedInteractions: false,
                ordersInfluenced: false,
            },
        })

        render(<ShoppingAssistantChannelTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Chat')).toBeInTheDocument()
        })

        const percentageElements = screen.getAllByText('85.6%')
        expect(percentageElements.length).toBe(2)
        expect(screen.getByText('45.1%')).toBeInTheDocument()
    })
})
