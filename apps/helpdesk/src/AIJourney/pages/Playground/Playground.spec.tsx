import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationsProvider, JourneyProvider } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { account } from 'fixtures/account'
import { renderWithRouter } from 'utils/testing'

import { Playground } from './Playground'

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

describe('<Playground />', () => {
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS(account),
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyContext.mockReturnValue({
            journey: undefined,
            journeyData: {
                id: '01JZAKJ16K3TG5G3HJ9BNAP327',
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
            currentIntegration: undefined,
            shopName: 'shopify-store',
            isLoading: false,
            journeyType: 'cart_abandoned',
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
        })
    })

    it('should render page', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <Playground />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.queryByText('AI Journey Playground placeholder'),
        ).toBeInTheDocument()
    })

    it('should render loading state', () => {
        mockUseJourneyContext.mockReturnValue({
            journey: undefined,
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
                            <Playground />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
})
