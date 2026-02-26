import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { JOURNEY_TYPES, STEPS_NAMES } from 'AIJourney/constants'
import { mockPhoneNumbers } from 'AIJourney/utils/test-fixtures/mockPhoneNumbers'
import { appQueryClient } from 'api/queryClient'
import { account } from 'fixtures/account'
import useAllIntegrations from 'hooks/useAllIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { renderWithRouter } from 'utils/testing'

import { Setup } from '../Setup/Setup'
import { AiJourneyOnboarding } from './AiJourneyOnboarding'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
    useParams: () => ({
        shopName: 'shopify-store',
    }),
}))

jest.mock('AIJourney/providers', () => ({
    ...jest.requireActual('AIJourney/providers'),
    useIntegrations: jest.fn(),
}))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    JourneyProvider: ({ children }: { children: React.ReactNode }) => children,
    useJourneyContext: jest.fn(),
}))

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useJourneyUpdateHandler: jest.fn(),
}))

const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
    .useJourneyUpdateHandler as jest.Mock

jest.mock('AIJourney/queries', () => ({
    ...jest.requireActual('AIJourney/queries'),
    useJourneys: jest.fn(),
    useCreateNewJourney: jest.fn(),
    useJourneyData: jest.fn(),
    useUpdateJourney: jest.fn(),
    useSmsIntegrations: jest.fn(),
}))

const mockUseJourneys = require('AIJourney/queries').useJourneys as jest.Mock
const mockUseSmsIntegrations = require('AIJourney/queries')
    .useSmsIntegrations as jest.Mock
const mockUseJourneyConfiguration = require('AIJourney/queries')
    .useJourneyData as jest.Mock
const mockUseCreateNewJourney = require('AIJourney/queries')
    .useCreateNewJourney as jest.Mock
const mockUseUpdateJourney = require('AIJourney/queries')
    .useUpdateJourney as jest.Mock

const mockUseIntegrations = require('AIJourney/providers')
    .useIntegrations as jest.Mock
const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

jest.mock('hooks/useAppSelector', () => jest.fn())
const mockUseAppSelector = useAppSelector as jest.Mock

jest.mock('hooks/useAllIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useStoreConfiguration', () => ({
    useStoreConfiguration: jest.fn(),
}))

const mockUseStoreConfiguration = useStoreConfiguration as jest.Mock

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

describe('<AiJourneyOnboarding />', () => {
    const mockHandleUpdate = jest.fn()
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS(account),
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyContext.mockReturnValue({
            journey: undefined,
            journeyData: undefined,
            currentIntegration: { id: 1, name: 'shopify-store' },
            shopName: 'shopify-store',
            isLoading: false,
            journeyType: 'cart_abandoned',
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
        })

        mockUseJourneyUpdateHandler.mockImplementation(() => ({
            handleUpdate: mockHandleUpdate,
        }))
        const mockCreateJourneyMutateAsync = jest.fn().mockResolvedValue({})
        const mockUpdateMutateAsync = jest.fn().mockResolvedValue({})

        mockUseJourneys.mockImplementation(() => ({
            data: [],
            isError: false,
            isLoading: false,
        }))

        mockUseIntegrations.mockImplementation(() => ({
            integrations: [{ id: 1, name: 'shopify-store' }],
            isLoading: false,
        }))

        mockUseAppSelector.mockImplementation((selector) => {
            if (selector.name === 'getCurrentAccountState') {
                return fromJS(account)
            }
            // Default to phone numbers for getNewPhoneNumbers selector
            return {
                '1': mockPhoneNumbers['1'],
                '2': {
                    ...mockPhoneNumbers['2'],
                    name: 'Regular Phone 2',
                },
            }
        })

        mockUseSmsIntegrations.mockReturnValue({
            data: [
                { sms_integration_id: 1, store_integration_id: 1 },
                { sms_integration_id: 2, store_integration_id: 2 },
            ],
            isLoading: false,
            error: null,
        })

        mockUseStoreConfiguration.mockReturnValue({
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
            isLoading: false,
        })

        mockUseJourneyConfiguration.mockImplementation(() => ({
            data: {
                max_follow_up_messages: 3,
                offer_discount: true,
                max_discount_percent: 20,
                sms_sender_number: '415-111-111',
                sms_sender_integration_id: 1,
            },
            isError: false,
            isLoading: false,
        }))

        mockUseCreateNewJourney.mockImplementation(() => ({
            mutateAsync: mockCreateJourneyMutateAsync,
            isError: false,
            isLoading: false,
        }))

        mockUseUpdateJourney.mockImplementation(() => ({
            mutateAsync: mockUpdateMutateAsync,
            isError: false,
            isLoading: false,
        }))
    })

    it('should render 3 steps correctly', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <AiJourneyOnboarding
                        journeyType={JOURNEY_TYPES.CART_ABANDONMENT}
                        step={STEPS_NAMES.SETUP}
                        stepComponent={Setup}
                    />
                </QueryClientProvider>
            </Provider>,
        )
        expect(screen.getByText('SMS Cart Abandoned flow')).toBeInTheDocument()

        expect(screen.getByText('Setup')).toBeInTheDocument()
        expect(screen.getByText('Test')).toBeInTheDocument()
        expect(screen.getByText('Activate')).toBeInTheDocument()
    })

    it('should render browse abandoned title when joruneyType is session-abandoned', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <AiJourneyOnboarding
                        journeyType={JOURNEY_TYPES.SESSION_ABANDONMENT}
                        step={STEPS_NAMES.SETUP}
                        stepComponent={Setup}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByText('SMS Browse Abandoned flow'),
        ).toBeInTheDocument()
    })
})
