import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import { appQueryClient } from '../../../api/queryClient'
import { JourneyProvider, useJourneyContext } from './JourneyProvider'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
}))

jest.mock(
    'AIJourney/providers/IntegrationsProvider/IntegrationsProvider',
    () => ({
        useIntegrations: jest.fn(),
    }),
)

jest.mock('@gorgias/convert-client', () => ({
    getAllJourneysPublic: jest.fn(),
    getJourneyDetails: jest.fn(),
}))

jest.mock('AIJourney/providers/TokenProvider/TokenProvider', () => ({
    useAccessToken: jest.fn(() => 'mock-token'),
}))

jest.mock('AIJourney/queries/useJourneyData/useJourneyData', () => ({
    useJourneyData: jest.fn(),
}))

jest.mock('hooks/useAppSelector', () => jest.fn())

jest.mock('models/aiAgent/resources/configuration', () => ({
    getStoresConfigurations: jest.fn(),
}))

jest.mock('models/aiAgent/queries', () => ({
    ...jest.requireActual('models/aiAgent/queries'),
    useGetStoresConfigurationForAccount: jest.fn(),
}))

const mockUseParams = useParams as jest.Mock
const mockUseIntegrations =
    require('AIJourney/providers/IntegrationsProvider/IntegrationsProvider').useIntegrations
const mockGetAllJourneysPublic =
    require('@gorgias/convert-client').getAllJourneysPublic
const mockGetJourneyDetails =
    require('@gorgias/convert-client').getJourneyDetails
const mockUseAppSelector = require('hooks/useAppSelector') as jest.Mock
const mockUseJourneyData =
    require('AIJourney/queries/useJourneyData/useJourneyData').useJourneyData
const mockUseGetStoresConfigurationForAccount =
    require('models/aiAgent/queries').useGetStoresConfigurationForAccount

const TestComponent = () => {
    const {
        journey,
        journeyData,
        currentIntegration,
        shopName,
        isLoading,
        journeyType,
        storeConfiguration,
    } = useJourneyContext()

    return (
        <div>
            <div data-testid="isLoading">
                {isLoading ? 'loading' : 'loaded'}
            </div>
            <div data-testid="shopName">{shopName}</div>
            <div data-testid="journeyType">{journeyType}</div>
            <div data-testid="currentIntegration">
                {currentIntegration?.name}
            </div>
            <div data-testid="journey">{journey?.id}</div>
            <div data-testid="journeyConfiguration">
                {journeyData?.configuration?.max_follow_up_messages}
            </div>
            <div data-testid="storeConfiguration">
                {storeConfiguration?.storeName}
            </div>
        </div>
    )
}

describe('<JourneyProvider />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        // Mock useAppSelector to return a mock account with domain
        mockUseAppSelector.mockReturnValue({
            get: (key: string) => {
                if (key === 'domain') return 'test-domain'
                return null
            },
        })

        // Mock useGetStoresConfigurationForAccount - by default returns data with test-shop
        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            data: {
                storeName: 'test-shop',
                monitoredSmsIntegrations: [1, 2],
            },
            isLoading: false,
        })

        // Mock useJourneyData
        mockUseJourneyData.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        // Default mock for getAllJourneysPublic
        mockGetAllJourneysPublic.mockResolvedValue({
            data: [],
        })

        // Default mock for getJourneyDetails
        mockGetJourneyDetails.mockResolvedValue({
            data: {
                configuration: null,
            },
        })
    })

    it('provides journey data and loading state', async () => {
        mockUseParams.mockReturnValue({ shopName: 'test-shop' })
        mockUseIntegrations.mockReturnValue({
            currentIntegration: { id: 1, name: 'test-shop', type: 'shopify' },
            isLoading: false,
        })
        mockGetAllJourneysPublic.mockResolvedValue({
            data: [
                {
                    id: 'journey-1',
                    type: 'cart_abandoned',
                    state: 'active',
                    message_instructions: 'Test instructions',
                },
                {
                    id: 'journey-2',
                    type: 'other_type',
                    state: 'draft',
                },
            ],
        })
        mockUseJourneyData.mockReturnValue({
            data: {
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 10,
                },
            },
            isLoading: false,
        })

        render(
            <QueryClientProvider client={appQueryClient}>
                <JourneyProvider>
                    <TestComponent />
                </JourneyProvider>
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(screen.getByTestId('isLoading')).toHaveTextContent('loaded')
            expect(screen.getByTestId('shopName')).toHaveTextContent(
                'test-shop',
            )
            expect(screen.getByTestId('journeyType')).toHaveTextContent(
                'cart_abandoned',
            )
            expect(screen.getByTestId('currentIntegration')).toHaveTextContent(
                'test-shop',
            )
            expect(screen.getByTestId('journey')).toHaveTextContent('journey-1')
            expect(
                screen.getByTestId('journeyConfiguration'),
            ).toHaveTextContent('3')
            expect(screen.getByTestId('storeConfiguration')).toHaveTextContent(
                'test-shop',
            )
        })
    })

    it('provides loading state when data is loading', () => {
        mockUseParams.mockReturnValue({ shopName: 'test-shop' })
        mockUseIntegrations.mockReturnValue({
            currentIntegration: undefined,
            isLoading: true,
        })
        // Don't need to mock getAllJourneysPublic for loading state
        // as the query won't be enabled without integrationId

        render(
            <QueryClientProvider client={appQueryClient}>
                <JourneyProvider>
                    <TestComponent />
                </JourneyProvider>
            </QueryClientProvider>,
        )

        expect(screen.getByTestId('isLoading')).toHaveTextContent('loading')
        expect(screen.getByTestId('shopName')).toHaveTextContent('test-shop')
    })

    it('throws if used outside provider', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
        const BrokenComponent = () => {
            useJourneyContext()
            return null
        }

        expect(() => render(<BrokenComponent />)).toThrow(
            'useJourneyContext must be used within JourneyProvider',
        )

        spy.mockRestore()
    })
})
