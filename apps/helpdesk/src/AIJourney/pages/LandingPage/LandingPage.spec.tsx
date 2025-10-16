import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { IntegrationsProvider, JourneyProvider } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { account } from 'fixtures/account'
import useAllIntegrations from 'hooks/useAllIntegrations'
import { renderWithRouter } from 'utils/testing'

import { LandingPage } from './LandingPage'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

jest.mock('hooks/useAllIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))
;(useAllIntegrations as jest.Mock).mockReturnValue({
    integrations: [
        {
            id: 1,
            type: IntegrationType.Shopify,
            name: 'shopify-store',
            meta: { shop_name: 'shopify-store' },
        },
    ],
    isLoading: false,
})

jest.mock('AIJourney/queries', () => ({
    ...jest.requireActual('AIJourney/queries'),
    useJourneys: jest.fn(() => ({
        data: [],
        isError: false,
    })),
}))

jest.mock('AIJourney/providers', () => ({
    ...jest.requireActual('AIJourney/providers'),
    useIntegrations: jest.fn(),
}))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

const mockStore = configureMockStore([thunk])({
    currentAccount: fromJS(account),
})

describe('<LandingPage />', () => {
    afterEach(() => {
        mockHistoryPush.mockClear()
        jest.useRealTimers()
    })

    beforeEach(() => {
        mockUseJourneyContext.mockReturnValue({
            journey: undefined,
            journeyData: undefined,
            currentIntegration: undefined,
            shopName: 'shopify-store',
            isLoading: false,
            journeyType: 'cart_abandoned',
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
        })
    })

    it('should render AI Journey landing page', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <LandingPage />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
    })
    it('should redirect to setup page when button is clicked', async () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <JourneyProvider>
                            <LandingPage />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        const buttonLabel = screen.getByText('Try out now')
        expect(buttonLabel).toBeInTheDocument()

        const button = screen.getByTestId('ai-journey-button')
        await act(async () => {
            await userEvent.click(button)
        })
        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledTimes(1)
        })
    })

    it('should redirect to performance page when AI Journey is already active', async () => {
        mockUseJourneyContext.mockReturnValue({
            currentJourney: { id: 'journey-123', type: 'cart_abandoned' },
            journeyData: {
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_number: '(415)-111-111',
                    sms_sender_integration_id: 1,
                },
            },
            currentIntegration: { id: 1, name: 'shopify-store' },
            shopName: 'shopify-store',
            isLoading: false,
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
                            <LandingPage />
                        </JourneyProvider>
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledTimes(1)
        })
    })
})
