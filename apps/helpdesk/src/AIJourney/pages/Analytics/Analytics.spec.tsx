import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import moment from 'moment/moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { JourneyProvider } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { account } from 'fixtures/account'
import { renderWithRouter } from 'utils/testing'

import { ReportingGranularity } from '../../../domains/reporting/models/types'
import { FiltersPanelComponent } from '../../../domains/reporting/pages/common/filters/FiltersPanel'
import { Analytics } from './Analytics'

jest.mock('react-dnd', () => ({
    DndProvider: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
    useDrag: () => [{ isDragging: false }, jest.fn(), jest.fn()],
    useDrop: () => [{ isOver: false }, jest.fn()],
}))
jest.mock('react-dnd-html5-backend', () => ({ HTML5Backend: {} }))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useFilters: jest.fn(),
}))

jest.mock(
    'AIJourney/hooks/useAIJourneyTotalSales/useAIJourneyTotalSales',
    () => ({
        useAIJourneyTotalSales: jest.fn(),
    }),
)

jest.mock(
    'AIJourney/hooks/useAIJourneyConversionRate/useAIJourneyConversionRate',
    () => ({
        useAIJourneyConversionRate: jest.fn(),
    }),
)

jest.mock(
    'AIJourney/hooks/useAIJourneyMessagesSent/useAIJourneyMessagesSent',
    () => ({
        useAIJourneyMessagesSent: jest.fn(),
    }),
)

jest.mock(
    'AIJourney/hooks/useAIJourneyOptOutRate/useAIJourneyOptOutRate',
    () => ({
        useAIJourneyOptOutRate: jest.fn(),
    }),
)

jest.mock(
    'AIJourney/hooks/useAIJourneyResponseRate/useAIJourneyResponseRate',
    () => ({
        useAIJourneyResponseRate: jest.fn(),
    }),
)

jest.mock('AIJourney/hooks/useClickThroughRate/useClickThroughRate', () => ({
    useClickThroughRate: jest.fn(),
}))

jest.mock(
    'AIJourney/hooks/useAIJourneyTotalOrders/useAIJourneyTotalOrders',
    () => ({
        useAIJourneyTotalOrders: jest.fn(),
    }),
)

jest.mock('AIJourney/hooks/useAverageOrderValue/useAverageOrderValue', () => ({
    useAverageOrderValue: jest.fn(),
}))

jest.mock(
    'AIJourney/hooks/useRevenuePerRecipient/useRevenuePerRecipient',
    () => ({
        useRevenuePerRecipient: jest.fn(),
    }),
)

jest.mock(
    'domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore',
    () => ({
        useGetNamespacedShopNameForStore: jest.fn(),
    }),
)

jest.mock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
    () => ({
        useStatsFilters: jest.fn(),
    }),
)

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock
const mockUseFilters = require('AIJourney/hooks').useFilters as jest.Mock
const mockUseAIJourneyRevenue =
    require('AIJourney/hooks/useAIJourneyTotalSales/useAIJourneyTotalSales')
        .useAIJourneyTotalSales as jest.Mock
const mockUseAIJourneyConversionRate =
    require('AIJourney/hooks/useAIJourneyConversionRate/useAIJourneyConversionRate')
        .useAIJourneyConversionRate as jest.Mock
const mockUseAIJourneyMessagesSent =
    require('AIJourney/hooks/useAIJourneyMessagesSent/useAIJourneyMessagesSent')
        .useAIJourneyMessagesSent as jest.Mock
const mockUseAIJourneyOptOutRate =
    require('AIJourney/hooks/useAIJourneyOptOutRate/useAIJourneyOptOutRate')
        .useAIJourneyOptOutRate as jest.Mock
const mockUseAIJourneyResponseRate =
    require('AIJourney/hooks/useAIJourneyResponseRate/useAIJourneyResponseRate')
        .useAIJourneyResponseRate as jest.Mock
const mockUseClickThroughRate =
    require('AIJourney/hooks/useClickThroughRate/useClickThroughRate')
        .useClickThroughRate as jest.Mock
const mockUseAIJourneyTotalOrders =
    require('AIJourney/hooks/useAIJourneyTotalOrders/useAIJourneyTotalOrders')
        .useAIJourneyTotalOrders as jest.Mock
const mockUseAverageOrderValue =
    require('AIJourney/hooks/useAverageOrderValue/useAverageOrderValue')
        .useAverageOrderValue as jest.Mock
const mockUseRevenuePerRecipient =
    require('AIJourney/hooks/useRevenuePerRecipient/useRevenuePerRecipient')
        .useRevenuePerRecipient as jest.Mock
const mockUseGetNamespacedShopNameForStore =
    require('domains/reporting/pages/convert/hooks/useGetNamespacedShopNameForStore')
        .useGetNamespacedShopNameForStore as jest.Mock
const mockUseStatsFilters =
    require('domains/reporting/hooks/support-performance/useStatsFilters')
        .useStatsFilters as jest.Mock
const mockDiscountCodesUsageSection = require('AIJourney/components')
    .DiscountCodesUsageSection as jest.Mock
const mockAudienceHealthSection = require('AIJourney/components')
    .AudienceHealthSection as jest.Mock
const mockDrillDownModal =
    require('domains/reporting/pages/common/drill-down/DrillDownModal')
        .DrillDownModal as jest.Mock

jest.mock('domains/reporting/pages/common/filters/FiltersPanel')
const FiltersPanelComponentMock = assumeMock(FiltersPanelComponent)

jest.mock('domains/reporting/pages/common/filters/FiltersPanelWrapper', () => ({
    __esModule: true,
    default: () => <div data-testid="filters-panel-wrapper" />,
}))

jest.mock('AIJourney/components', () => ({
    ...jest.requireActual('AIJourney/components'),
    DiscountCodesUsageSection: jest.fn(() => null),
    AudienceHealthSection: jest.fn(() => null),
}))

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: jest.fn(() => null),
}))

describe('<Analytics />', () => {
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS(account),
        integrations: fromJS({
            integrations: [],
            authentication: {},
            state: { loading: {}, error: {} },
        }),
    })

    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.removeItem('ai-journey-analytics-metrics-preferences')
        FiltersPanelComponentMock.mockImplementation(() => <div />)

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    end_datetime: moment().toISOString(),
                    start_datetime: moment().toISOString(),
                },
            },
            userTimezone: 'America/New_York',
            granularity: ReportingGranularity.Day,
        })

        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                id: 'journey-123',
                type: 'cart_abandoned',
                account_id: 6069,
                store_integration_id: 286584,
                store_name: 'gorgias-product-demo',
                store_type: 'shopify',
                state: 'active',
                message_instructions: null,
                created_datetime: '2025-07-04T11:36:13.269056',
                meta: {
                    ticket_view_id: 2099726,
                },
            },
            currentIntegration: { id: 286584 },
            shopName: 'shopify-store',
            isLoading: false,
            journeyType: 'cart_abandoned',
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
        })

        mockUseFilters.mockReturnValue({
            period: {
                start_datetime: '2025-01-01T00:00:00Z',
                end_datetime: '2025-01-31T23:59:59Z',
            },
        })

        mockUseAIJourneyRevenue.mockReturnValue({
            label: 'GMV Influenced',
            value: 0,
            prevValue: null,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'currency',
            currency: 'USD',
            isLoading: false,
        })

        mockUseAIJourneyTotalOrders.mockReturnValue({
            label: 'Orders',
            value: 0,
            prevValue: null,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'decimal-precision-1',
            isLoading: false,
        })

        mockUseAIJourneyConversionRate.mockReturnValue({
            label: 'Conversion Rate',
            value: 0,
            prevValue: null,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'percent',
            isLoading: false,
        })

        mockUseAIJourneyMessagesSent.mockReturnValue({
            label: 'Total Conversations',
            value: 100,
            prevValue: 80,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'decimal-precision-1',
            isLoading: false,
        })

        mockUseAIJourneyOptOutRate.mockReturnValue({
            label: 'Opt Out Rate',
            value: 0,
            prevValue: null,
            series: [],
            interpretAs: 'less-is-better',
            metricFormat: 'percent',
            isLoading: false,
        })

        mockUseAIJourneyResponseRate.mockReturnValue({
            label: 'Response Rate',
            value: 0,
            prevValue: null,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'percent',
            isLoading: false,
        })

        mockUseClickThroughRate.mockReturnValue({
            label: 'Click-through rate (CTR)',
            value: 0,
            prevValue: null,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'percent',
            isLoading: false,
        })

        mockUseAverageOrderValue.mockReturnValue({
            label: 'Average Order Value',
            value: 0,
            prevValue: null,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'currency',
            currency: 'USD',
            isLoading: false,
        })

        mockUseRevenuePerRecipient.mockReturnValue({
            label: 'Revenue Per Recipient',
            value: 0,
            prevValue: null,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'currency',
            currency: 'USD',
            isLoading: false,
        })

        mockUseGetNamespacedShopNameForStore.mockReturnValue('shopify-store')
    })

    it('should render loading state', () => {
        mockUseJourneyContext.mockReturnValue({
            journeyData: undefined,
            currentIntegration: undefined,
            shopName: 'shopify-store',
            isLoading: true,
            journeyType: 'cart_abandoned',
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Analytics />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render loading state when key metrics are loading', () => {
        mockUseClickThroughRate.mockReturnValue({
            label: 'Click Through Rate',
            value: 0,
            prevValue: null,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'percent',
            isLoading: true,
        })

        mockUseAIJourneyResponseRate.mockReturnValue({
            label: 'Response Rate',
            value: 0,
            prevValue: null,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'percent',
            isLoading: true,
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Analytics />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
    })

    it('should render key metrics with values', () => {
        localStorage.setItem(
            'ai-journey-analytics-metrics-preferences',
            JSON.stringify([
                {
                    id: 'Click-through rate (CTR)',
                    label: 'Click-through rate (CTR)',
                    visibility: true,
                },
                {
                    id: 'Messages sent',
                    label: 'Messages sent',
                    visibility: true,
                },
            ]),
        )

        mockUseClickThroughRate.mockReturnValue({
            label: 'Click-through rate (CTR)',
            value: 25.5,
            prevValue: 20.3,
            series: [
                { date: '2025-01-01', value: 22 },
                { date: '2025-01-08', value: 24 },
                { date: '2025-01-15', value: 25.5 },
            ],
            interpretAs: 'more-is-better',
            metricFormat: 'percent',
            isLoading: false,
        })

        mockUseAIJourneyMessagesSent.mockReturnValue({
            label: 'Messages sent',
            value: 150,
            prevValue: 100,
            series: [
                { date: '2025-01-01', value: 50 },
                { date: '2025-01-08', value: 60 },
                { date: '2025-01-15', value: 40 },
            ],
            interpretAs: 'more-is-better',
            metricFormat: 'currency',
            currency: 'USD',
            isLoading: false,
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Analytics />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getAllByText('Click-through rate (CTR)').length,
        ).toBeGreaterThan(0)
        expect(screen.getAllByText('Messages sent').length).toBeGreaterThan(0)
        expect(screen.getByText(/25\.5%/)).toBeInTheDocument()
    })

    it('should filter by specific flows', () => {
        mockUseJourneyContext.mockReturnValue({
            journeys: [
                { id: 'flow-1', type: 'cart_abandoned' },
                { id: 'flow-2', type: 'post_purchase' },
            ],
            campaigns: [
                {
                    id: 'campaign-1',
                    campaign: { title: 'Campaign 1', state: 'active' },
                },
                {
                    id: 'campaign-2',
                    campaign: { title: 'Campaign 2', state: 'active' },
                },
            ],
            currentIntegration: { id: 286584 },
            shopName: 'shopify-store',
            currency: 'USD',
            isLoading: false,
            journeyType: 'cart_abandoned',
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
        })

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    end_datetime: moment().toISOString(),
                    start_datetime: moment().toISOString(),
                },
                journeyFlows: {
                    values: ['flow-1'],
                    operator: 'in',
                },
            },
            userTimezone: 'America/New_York',
            granularity: ReportingGranularity.Day,
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Analytics />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(mockUseAIJourneyRevenue).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            expect.any(Object),
            expect.any(String),
            expect.any(String),
            ['flow-1', 'campaign-1', 'campaign-2'],
        )
    })

    it('should filter by specific campaigns', () => {
        mockUseJourneyContext.mockReturnValue({
            journeys: [
                { id: 'flow-1', type: 'cart_abandoned' },
                { id: 'flow-2', type: 'post_purchase' },
            ],
            campaigns: [
                {
                    id: 'campaign-1',
                    campaign: { title: 'Campaign 1', state: 'active' },
                },
                {
                    id: 'campaign-2',
                    campaign: { title: 'Campaign 2', state: 'active' },
                },
            ],
            currentIntegration: { id: 286584 },
            shopName: 'shopify-store',
            currency: 'USD',
            isLoading: false,
            journeyType: 'cart_abandoned',
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
        })

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    end_datetime: moment().toISOString(),
                    start_datetime: moment().toISOString(),
                },
                journeyCampaigns: {
                    values: ['campaign-1'],
                    operator: 'in',
                },
            },
            userTimezone: 'America/New_York',
            granularity: ReportingGranularity.Day,
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Analytics />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(mockUseAIJourneyRevenue).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            expect.any(Object),
            expect.any(String),
            expect.any(String),
            ['flow-1', 'flow-2', 'campaign-1'],
        )
    })

    it('should not filter when all are selected', () => {
        mockUseJourneyContext.mockReturnValue({
            journeys: [{ id: 'flow-1', type: 'cart_abandoned' }],
            campaigns: [
                {
                    id: 'campaign-1',
                    campaign: { title: 'Campaign 1', state: 'active' },
                },
            ],
            currentIntegration: { id: 286584 },
            shopName: 'shopify-store',
            currency: 'USD',
            isLoading: false,
            journeyType: 'cart_abandoned',
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
        })

        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    end_datetime: moment().toISOString(),
                    start_datetime: moment().toISOString(),
                },
            },
            userTimezone: 'America/New_York',
            granularity: ReportingGranularity.Day,
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Analytics />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(mockUseAIJourneyRevenue).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            expect.any(Object),
            expect.any(String),
            expect.any(String),
            [],
        )
    })

    it('should pass hints from metrics to ConfigureMetricsModal', async () => {
        const user = userEvent.setup()

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Analytics />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: /edit key metrics/i }),
            )
        })

        await waitFor(() => {
            const modal = screen.getByRole('dialog')
            const infoIcons = within(modal).getAllByLabelText('info')
            expect(infoIcons).toHaveLength(8)
        })
    })

    it('should render DiscountCodesUsageSection with correct props', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Analytics />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(mockDiscountCodesUsageSection).toHaveBeenCalledWith(
            expect.objectContaining({
                integrationId: '286584',
                userTimezone: 'America/New_York',
                filters: expect.objectContaining({
                    period: expect.any(Object),
                }),
                journeyIds: [],
            }),
            expect.anything(),
        )
    })

    it('should render AudienceHealthSection with correct props', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Analytics />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(mockAudienceHealthSection).toHaveBeenCalledWith(
            expect.objectContaining({
                integrationId: '286584',
                userTimezone: 'America/New_York',
                filters: expect.objectContaining({
                    period: expect.any(Object),
                }),
                shopName: 'shopify-store',
                journeyIds: [],
            }),
            expect.anything(),
        )
    })

    it('should render DrillDownModal', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Analytics />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(mockDrillDownModal).toHaveBeenCalled()
    })

    it('should render with non-null prevValues for revenue, orders, response rate and average order value, and null prevValue for messages sent', () => {
        mockUseAIJourneyRevenue.mockReturnValue({
            label: 'GMV Influenced',
            value: 1000,
            prevValue: 800,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'currency',
            currency: 'USD',
            isLoading: false,
        })

        mockUseAIJourneyTotalOrders.mockReturnValue({
            label: 'Orders',
            value: 50,
            prevValue: 40,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'decimal-precision-1',
            isLoading: false,
        })

        mockUseAIJourneyResponseRate.mockReturnValue({
            label: 'Response Rate',
            value: 0.5,
            prevValue: 0.4,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'percent',
            isLoading: false,
        })

        mockUseAverageOrderValue.mockReturnValue({
            label: 'Average Order Value',
            value: 200,
            prevValue: 180,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'currency',
            currency: 'USD',
            isLoading: false,
        })

        mockUseAIJourneyMessagesSent.mockReturnValue({
            label: 'Messages sent',
            value: 100,
            prevValue: null,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'decimal',
            isLoading: false,
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Analytics />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('AI Journey Analytics')).toBeInTheDocument()
    })

    it('should handle unknown metric IDs in saved preferences gracefully', async () => {
        const user = userEvent.setup()

        localStorage.setItem(
            'ai-journey-analytics-metrics-preferences',
            JSON.stringify([
                { id: 'unknown-metric', label: 'Unknown', visibility: true },
                {
                    id: 'Click-through rate (CTR)',
                    label: 'Click-through rate (CTR)',
                    visibility: true,
                },
            ]),
        )

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <Analytics />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )
        await act(async () => {
            await user.click(
                screen.getByRole('button', { name: /edit key metrics/i }),
            )
        })
        await waitFor(() => {
            const modal = screen.getByRole('dialog')
            const infoIcons = within(modal).getAllByLabelText('info')
            expect(infoIcons).toHaveLength(1)
        })
    })
})
