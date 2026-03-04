import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import moment from 'moment/moment'
import { Provider } from 'react-redux'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { useProductRecommendations } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useProductRecommendations'
import { initialState as uiFiltersInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import * as useShoppingAssistantChannelMetricsModule from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantChannelMetrics'
import { useAiAgentAnalyticsDashboardTracking } from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

import { ShoppingAssistantPerformanceBreakdownTable } from '../ShoppingAssistantPerformanceBreakdownTable'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantChannelMetrics',
)
jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useProductRecommendations',
)
jest.mock('pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking')

const mockUseStatsFilters = useStatsFilters as jest.MockedFunction<
    typeof useStatsFilters
>
const mockUseShoppingAssistantChannelMetrics =
    useShoppingAssistantChannelMetricsModule.useShoppingAssistantChannelMetrics as jest.MockedFunction<
        typeof useShoppingAssistantChannelMetricsModule.useShoppingAssistantChannelMetrics
    >
const mockUseProductRecommendations =
    useProductRecommendations as jest.MockedFunction<
        typeof useProductRecommendations
    >
const mockUseAiAgentAnalyticsDashboardTracking =
    useAiAgentAnalyticsDashboardTracking as jest.MockedFunction<
        typeof useAiAgentAnalyticsDashboardTracking
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

describe('ShoppingAssistantPerformanceBreakdownTable', () => {
    beforeAll(() => {
        // Mock getAnimations for jsdom
        Element.prototype.getAnimations = jest.fn(() => [])
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAiAgentAnalyticsDashboardTracking.mockReturnValue({
            onTableTabInteraction: jest.fn(),
            onAnalyticsReportViewed: jest.fn(),
            onAnalyticsAiAgentTabSelected: jest.fn(),
            onExport: jest.fn(),
        })

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00Z',
                    end_datetime: '2024-01-31T23:59:59Z',
                },
            },
            userTimezone: 'UTC',
        } as any)

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

        mockUseProductRecommendations.mockReturnValue({
            isError: false,
            isFetching: false,
            data: [
                {
                    product: {
                        id: 1,
                        title: 'Test Product 1',
                        created_at: new Date().toISOString(),
                        image: null,
                        images: [],
                        options: [],
                        variants: [],
                    },
                    metrics: {
                        [ProductTableKeys.NumberOfRecommendations]: 100,
                        [ProductTableKeys.CTR]: 0.25,
                        [ProductTableKeys.BTR]: 0.1,
                    },
                },
            ],
        })
    })

    it('should render the table heading', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        expect(screen.getByText('Performance breakdown')).toBeInTheDocument()
    })

    it('should render button group with only Channel and Top products recommended tabs', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        expect(
            screen.getByRole('radio', { name: /Channel/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('radio', { name: /Top products recommended/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('radio', { name: /Engagement feature/i }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('radio', { name: /Intent/i }),
        ).not.toBeInTheDocument()
    })

    it('should default to Channel tab', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        const channelButton = screen.getByRole('radio', { name: /Channel/i })
        expect(channelButton).toHaveAttribute('aria-checked', 'true')
    })

    it('should render Channel table by default with correct data', async () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('Chat')).toBeInTheDocument()
        })

        expect(screen.getByText('Automation rate')).toBeInTheDocument()
    })

    it('should render a table', () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        const table = screen.getByRole('table')
        expect(table).toBeInTheDocument()
    })

    it('should render table toolbar with item count', async () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />, {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(screen.getByText('1 item')).toBeInTheDocument()
        })
    })

    it('should have settings button in toolbar', async () => {
        render(<ShoppingAssistantPerformanceBreakdownTable />, {
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
