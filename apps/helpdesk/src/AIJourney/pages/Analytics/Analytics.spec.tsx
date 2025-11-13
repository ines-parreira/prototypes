import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationsProvider, JourneyProvider } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { getCleanStatsFiltersWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import { account } from 'fixtures/account'
import { renderWithRouter } from 'utils/testing'

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

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(),
}))

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
const mockUseAppSelector = require('hooks/useAppSelector').default as jest.Mock

describe('<Analytics />', () => {
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS(account),
    })

    beforeEach(() => {
        jest.clearAllMocks()

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

        mockUseAppSelector.mockImplementation((selector: any) => {
            if (selector === getCleanStatsFiltersWithTimezone) {
                return { userTimezone: 'America/New_York' }
            }
            if (selector.name === 'getCurrentAccountState') {
                return fromJS(account)
            }
            return undefined
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
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <Analytics />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render loading state when both metrics are loading', () => {
        mockUseAIJourneyGmvInfluenced.mockReturnValue({
            label: 'GMV Influenced',
            value: 0,
            prevValue: null,
            series: [],
            interpretAs: 'more-is-better',
            metricFormat: 'currency',
            currency: 'USD',
            isLoading: true,
        })

        mockUseAIJourneyConversionRate.mockReturnValue({
            label: 'Conversion Rate',
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
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <Analytics />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getAllByLabelText('Loading')).toHaveLength(2)
    })

    it('should render both metrics with values', () => {
        mockUseAIJourneyGmvInfluenced.mockReturnValue({
            label: 'GMV Influenced',
            value: 15000.5,
            prevValue: 12000,
            series: [
                { date: '2025-01-01', value: 5000 },
                { date: '2025-01-08', value: 6000 },
                { date: '2025-01-15', value: 4000.5 },
            ],
            interpretAs: 'more-is-better',
            metricFormat: 'currency',
            currency: 'USD',
            isLoading: false,
        })

        mockUseAIJourneyConversionRate.mockReturnValue({
            label: 'Conversion Rate',
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

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <Analytics />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('GMV Influenced')).toBeInTheDocument()
        expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
        expect(screen.getByText('$15,000.5')).toBeInTheDocument()
        expect(screen.getByText(/25\.5%/)).toBeInTheDocument()
    })
})
