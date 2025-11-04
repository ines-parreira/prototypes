import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { useParams } from 'react-router-dom'

import { appQueryClient } from '../../../api/queryClient'
import { CampaignProvider, useCampaignContext } from './CampaignProvider'

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
    ...jest.requireActual('@gorgias/convert-client'),
    getAllJourneysPublic: jest.fn(),
    getJourneyDetails: jest.fn(),
}))

jest.mock('AIJourney/providers/TokenProvider/TokenProvider', () => ({
    useAccessToken: jest.fn(() => 'mock-token'),
}))

jest.mock('AIJourney/queries/useJourneys/useJourneys', () => ({
    useJourneys: jest.fn(),
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
const mockUseAppSelector = require('hooks/useAppSelector') as jest.Mock
const mockUseJourneys =
    require('AIJourney/queries/useJourneys/useJourneys').useJourneys
const mockUseGetStoresConfigurationForAccount =
    require('models/aiAgent/queries').useGetStoresConfigurationForAccount

const TestComponent = () => {
    const {
        campaigns,
        currentIntegration,
        shopName,
        isLoading,
        storeConfiguration,
    } = useCampaignContext()

    return (
        <div>
            <div data-testid="isLoading">
                {isLoading ? 'loading' : 'loaded'}
            </div>
            <div data-testid="shopName">{shopName}</div>
            <div data-testid="currentIntegration">
                {currentIntegration?.name}
            </div>
            <div data-testid="campaigns">{campaigns?.length}</div>
            <div data-testid="storeConfiguration">
                {storeConfiguration?.storeName}
            </div>
        </div>
    )
}

describe('<CampaignProvider />', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseParams.mockReturnValue({ shopName: 'test-shop' })

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

        mockUseJourneys.mockImplementation(() => ({
            data: [{ id: 'journey-123', type: 'campaign', state: 'active' }],
            isError: false,
            isLoading: false,
        }))
    })

    it('provides loading state when data is loading', () => {
        mockUseIntegrations.mockReturnValue({
            currentIntegration: undefined,
            isLoading: true,
        })
        // Don't need to mock getAllJourneysPublic for loading state
        // as the query won't be enabled without integrationId

        render(
            <QueryClientProvider client={appQueryClient}>
                <CampaignProvider>
                    <TestComponent />
                </CampaignProvider>
            </QueryClientProvider>,
        )

        expect(screen.getByTestId('isLoading')).toHaveTextContent('loading')
        expect(screen.getByTestId('shopName')).toHaveTextContent('test-shop')
    })

    it('throws if used outside provider', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
        const BrokenComponent = () => {
            useCampaignContext()
            return null
        }

        expect(() => render(<BrokenComponent />)).toThrow(
            'useCampaignContext must be used within CampaignProvider',
        )

        spy.mockRestore()
    })

    it('should return list of campaigns', () => {
        render(
            <QueryClientProvider client={appQueryClient}>
                <CampaignProvider>
                    <TestComponent />
                </CampaignProvider>
            </QueryClientProvider>,
        )

        expect(screen.getByTestId('campaigns')).toHaveTextContent('1')
    })
})
