import { FeatureFlagKey } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { JourneyStatusEnum } from '@gorgias/convert-client'
import { IntegrationType } from '@gorgias/helpdesk-types'

import { JourneyProvider } from 'AIJourney/providers'
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

const mockUseFlag = jest.fn()
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: (...args: any[]) => mockUseFlag(...args),
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
    integrations: fromJS({ integrations: [] }),
})

describe('<LandingPage />', () => {
    afterEach(() => {
        mockHistoryPush.mockClear()
        jest.useRealTimers()
    })

    beforeEach(() => {
        mockUseFlag.mockImplementation(() => false)

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
                    <JourneyProvider>
                        <LandingPage />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
    })

    it('should redirect to setup page when button is clicked', async () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <LandingPage />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        const buttonLabel = screen.getByText('Try out now')
        expect(buttonLabel).toBeInTheDocument()

        const abandonedCartButton = screen.getByText('Abandoned Cart')
        await act(async () => {
            await userEvent.click(abandonedCartButton)
        })
        const button = screen.getByTestId('ai-journey-button')
        await act(async () => {
            await userEvent.click(button)
        })
        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledTimes(1)
        })
    })

    it('should redirect to performance page when there are journeys (active or not)', async () => {
        mockUseJourneyContext.mockReturnValue({
            journeys: [
                {
                    id: 'journey-1',
                    state: JourneyStatusEnum.Draft,
                    type: 'cart_abandoned',
                },
                {
                    id: 'journey-2',
                    state: JourneyStatusEnum.Active,
                    type: 'session_abandoned',
                },
                {
                    id: 'journey-3',
                    state: JourneyStatusEnum.Draft,
                    type: 'cart_abandoned',
                },
            ],
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
                    <JourneyProvider>
                        <LandingPage />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledTimes(1)
        })
    })

    it('should not redirect to performance page when there are no journeys', async () => {
        mockUseJourneyContext.mockReturnValue({
            journeys: [],
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
                    <JourneyProvider>
                        <LandingPage />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledTimes(0)
        })
    })

    it('should not display campaigns option when feature flag is disabled', () => {
        mockUseFlag.mockImplementation((key: FeatureFlagKey) => {
            if (key === FeatureFlagKey.AiJourneyCampaignsEnabled) {
                return false
            }
            return false
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <LandingPage />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.queryByText('Campaigns')).not.toBeInTheDocument()
    })

    it('should display campaigns option when feature flag is enabled', () => {
        mockUseFlag.mockImplementation((key: FeatureFlagKey) => {
            if (key === FeatureFlagKey.AiJourneyCampaignsEnabled) {
                return true
            }
            return false
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <LandingPage />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('Campaigns')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Boost your sales with targeted SMS campaigns, crafted using AI to engage your audience effectively.',
            ),
        ).toBeInTheDocument()
    })

    it('should not display Welcome customer option when AiJourneyWelcomeFlowEnabled flag is disabled', () => {
        mockUseFlag.mockImplementation((key: FeatureFlagKey) => {
            if (key === FeatureFlagKey.AiJourneyWelcomeFlowEnabled) {
                return false
            }
            return false
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <LandingPage />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.queryByText('Welcome customer')).not.toBeInTheDocument()
    })

    it('should display Welcome customer option when AiJourneyWelcomeFlowEnabled flag is enabled', () => {
        mockUseFlag.mockImplementation((key: FeatureFlagKey) => {
            if (key === FeatureFlagKey.AiJourneyWelcomeFlowEnabled) {
                return true
            }
            return false
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <LandingPage />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('Welcome customer')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Make a great first impression, let the Welcome Journey turn new subscribers into loyal customers.',
            ),
        ).toBeInTheDocument()
    })

    it('should not display Customer Win-back option when AiJourneyWinBackEnabled flag is disabled', () => {
        mockUseFlag.mockImplementation((key: FeatureFlagKey) => {
            if (key === FeatureFlagKey.AiJourneyWinBackEnabled) {
                return false
            }
            return false
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <LandingPage />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.queryByText('Customer Win-back')).not.toBeInTheDocument()
    })

    it('should display Customer Win-back option when AiJourneyWinBackEnabled flag is enabled', () => {
        mockUseFlag.mockImplementation((key: FeatureFlagKey) => {
            if (key === FeatureFlagKey.AiJourneyWinBackEnabled) {
                return true
            }
            return false
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <LandingPage />
                    </JourneyProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('Customer Win-back')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Reconnect with inactive customers and revive their interest in your store using personalized AI-driven messages.',
            ),
        ).toBeInTheDocument()
    })
})
