import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
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
    'AIJourney/hooks/useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced',
    () => ({
        useAIJourneyGmvInfluenced: jest.fn(),
    }),
)

jest.mock(
    'AIJourney/hooks/useAIJourneyConversionRate/useAIJourneyConversionRate',
    () => ({
        useAIJourneyConversionRate: jest.fn(),
    }),
)

jest.mock(
    'AIJourney/hooks/useAIJourneyTotalConversations/useAIJourneyTotalConversations',
    () => ({
        useAIJourneyTotalConversations: jest.fn(),
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
const mockUseAIJourneyGmvInfluenced =
    require('AIJourney/hooks/useAIJourneyGmvInfluenced/useAIJourneyGmvInfluenced')
        .useAIJourneyGmvInfluenced as jest.Mock
const mockUseAIJourneyConversionRate =
    require('AIJourney/hooks/useAIJourneyConversionRate/useAIJourneyConversionRate')
        .useAIJourneyConversionRate as jest.Mock
const mockUseAIJourneyTotalConversations =
    require('AIJourney/hooks/useAIJourneyTotalConversations/useAIJourneyTotalConversations')
        .useAIJourneyTotalConversations as jest.Mock
const mockUseAIJourneyOptOutRate =
    require('AIJourney/hooks/useAIJourneyOptOutRate/useAIJourneyOptOutRate')
        .useAIJourneyOptOutRate as jest.Mock
const mockUseAIJourneyResponseRate =
    require('AIJourney/hooks/useAIJourneyResponseRate/useAIJourneyResponseRate')
        .useAIJourneyResponseRate as jest.Mock
const mockUseClickThroughRate =
    require('AIJourney/hooks/useClickThroughRate/useClickThroughRate')
        .useClickThroughRate as jest.Mock
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

jest.mock('domains/reporting/pages/common/filters/FiltersPanel')
const FiltersPanelComponentMock = assumeMock(FiltersPanelComponent)

jest.mock('domains/reporting/pages/common/filters/FiltersPanelWrapper', () => ({
    __esModule: true,
    default: () => <div data-testid="filters-panel-wrapper" />,
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

        mockUseAIJourneyGmvInfluenced.mockReturnValue({
            label: 'GMV Influenced',
            value: 0,
            prevValue: null,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'currency',
            currency: 'USD',
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

        mockUseAIJourneyTotalConversations.mockReturnValue({
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
            label: 'Click Through Rate',
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
        mockUseClickThroughRate.mockReturnValue({
            label: 'Click Through Rate',
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

        mockUseAIJourneyTotalConversations.mockReturnValue({
            label: 'Total Recipients',
            value: 150,
            prevValue: 100,
            series: [
                { date: '2025-01-01', value: 50 },
                { date: '2025-01-08', value: 60 },
                { date: '2025-01-15', value: 40 },
            ],
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

        expect(
            screen.getAllByText('Click Through Rate').length,
        ).toBeGreaterThan(0)
        expect(screen.getAllByText('Total Recipients').length).toBeGreaterThan(
            0,
        )
        expect(screen.getByText(/25\.5%/)).toBeInTheDocument()
        expect(screen.getByText('150')).toBeInTheDocument()
    })

    it('should filter journeys by campaign type only', () => {
        const campaigns = [
            { id: 1, name: 'Campaign 1' },
            { id: 2, name: 'Campaign 2' },
        ]

        mockUseJourneyContext.mockReturnValue({
            journeys: [{ id: 3, name: 'Journey 1' }],
            campaigns,
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
                journeyType: {
                    values: ['campaign'],
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

        expect(mockUseAIJourneyGmvInfluenced).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            expect.any(Object),
            expect.any(String),
            expect.any(String),
            [1, 2],
        )
    })

    it('should filter journeys by flow type only', () => {
        const journeys = [
            { id: 1, name: 'Journey 1' },
            { id: 2, name: 'Journey 2' },
        ]

        mockUseJourneyContext.mockReturnValue({
            journeys,
            campaigns: [{ id: 3, name: 'Campaign 1' }],
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
                journeyType: {
                    values: ['flow'],
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

        expect(mockUseAIJourneyGmvInfluenced).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            expect.any(Object),
            expect.any(String),
            expect.any(String),
            [1, 2],
        )
    })

    it('should not filter journeys when both types are selected', () => {
        mockUseJourneyContext.mockReturnValue({
            journeys: [{ id: 1, name: 'Journey 1' }],
            campaigns: [{ id: 2, name: 'Campaign 1' }],
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
                journeyType: {
                    values: ['campaign', 'flow'],
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

        expect(mockUseAIJourneyGmvInfluenced).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            expect.any(Object),
            expect.any(String),
            expect.any(String),
            [],
        )
    })
})
