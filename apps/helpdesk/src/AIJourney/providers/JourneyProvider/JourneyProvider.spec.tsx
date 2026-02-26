import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import type { Location } from 'history'
import { useLocation, useParams } from 'react-router-dom'

import { IntegrationType } from 'models/integration/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'

import { appQueryClient } from '../../../api/queryClient'
import { JourneyProvider, useJourneyContext } from './JourneyProvider'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useLocation: jest.fn(),
}))

const useParamsMock = jest.mocked(useParams)
const useLocationMock = jest.mocked(useLocation)

jest.mock('@gorgias/convert-client', () => ({
    ...jest.requireActual('@gorgias/convert-client'),
    getAllJourneysPublic: jest.fn(),
    getJourneyDetails: jest.fn(),
}))

jest.mock('AIJourney/queries/useJourneyData/useJourneyData', () => ({
    useJourneyData: jest.fn(),
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
const mockUseAppSelector = require('hooks/useAppSelector') as jest.Mock
const mockUseJourneyData =
    require('AIJourney/queries/useJourneyData/useJourneyData').useJourneyData
const mockUseJourneys =
    require('AIJourney/queries/useJourneys/useJourneys').useJourneys
const mockUseGetStoresConfigurationForAccount =
    require('models/aiAgent/queries').useGetStoresConfigurationForAccount

const TestComponent = () => {
    const {
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
            <div data-testid="journey">{journeyData?.id}</div>
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

        mockUseParams.mockReturnValue({ shopName: 'test-shop' })

        // Mock useAppSelector to return correct values per selector
        mockUseAppSelector.mockImplementation((selector: unknown) => {
            if (selector === getShopifyIntegrationsSortedByName) {
                return [
                    {
                        id: 1,
                        name: 'test-shop',
                        type: IntegrationType.Shopify,
                        meta: { shop_name: 'test-shop', currency: 'USD' },
                    },
                ]
            }
            if (selector === getCurrentAccountState) {
                return {
                    get: (key: string) => {
                        if (key === 'domain') return 'test-domain'
                        return null
                    },
                }
            }
            return undefined
        })

        // Mock useGetStoresConfigurationForAccount - by default returns data with test-shop
        mockUseGetStoresConfigurationForAccount.mockReturnValue({
            data: {
                storeName: 'test-shop',
                monitoredSmsIntegrations: [1, 2],
            },
            isLoading: false,
        })

        mockUseJourneyData.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        mockUseJourneys.mockImplementation(() => ({
            data: [
                { id: 'journey-123', type: 'cart_abandoned', state: 'active' },
            ],
            isError: false,
            isLoading: false,
        }))

        useLocationMock.mockReturnValue({
            pathname: '/app/ai-journey/test-shop/cart-abandoned/setup',
        } as Location)
    })

    it('provides journey data and loading state', async () => {
        mockUseJourneyData.mockReturnValue({
            data: {
                id: 'journey-1',
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
                'cart-abandoned',
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
        useLocationMock.mockReturnValue({
            pathname:
                '/app/ai-journey/test-shop/cart-abandoned/setup/journey-123',
        } as Location)

        mockUseJourneyData.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

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

    it('should return empty current journey if no journey is available ', () => {
        mockUseJourneys.mockImplementation(() => ({
            data: [],
            isError: false,
            isLoading: false,
        }))

        render(
            <QueryClientProvider client={appQueryClient}>
                <JourneyProvider>
                    <TestComponent />
                </JourneyProvider>
            </QueryClientProvider>,
        )

        expect(screen.getByTestId('journey')).toHaveTextContent('')
    })

    describe('journeyType from URL', () => {
        it('should extract cart-abandoned from URL path', () => {
            useParamsMock.mockReturnValue({ shopName: 'test-shop' })
            useLocationMock.mockReturnValue({
                pathname: '/app/ai-journey/test-shop/cart-abandoned/setup',
            } as Location)

            render(
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <TestComponent />
                    </JourneyProvider>
                </QueryClientProvider>,
            )

            expect(screen.getByTestId('journeyType')).toHaveTextContent(
                'cart-abandoned',
            )
        })

        it('should extract session-abandoned from URL path', () => {
            useParamsMock.mockReturnValue({ shopName: 'test-shop' })
            useLocationMock.mockReturnValue({
                pathname:
                    '/app/ai-journey/test-shop/session-abandoned/test/journey-456',
            } as Location)

            render(
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <TestComponent />
                    </JourneyProvider>
                </QueryClientProvider>,
            )

            expect(screen.getByTestId('journeyType')).toHaveTextContent(
                'session-abandoned',
            )
        })

        it('should default to cart-abandoned for invalid journey type in URL', () => {
            useParamsMock.mockReturnValue({ shopName: 'test-shop' })
            useLocationMock.mockReturnValue({
                pathname: '/app/ai-journey/test-shop/invalid-type/setup',
            } as Location)

            render(
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <TestComponent />
                    </JourneyProvider>
                </QueryClientProvider>,
            )

            expect(screen.getByTestId('journeyType')).toHaveTextContent(
                'cart-abandoned',
            )
        })

        it('should default to cart-abandoned when no journey type in URL', () => {
            useParamsMock.mockReturnValue({ shopName: 'test-shop' })
            useLocationMock.mockReturnValue({
                pathname: '/app/ai-journey/test-shop',
            } as Location)

            render(
                <QueryClientProvider client={appQueryClient}>
                    <JourneyProvider>
                        <TestComponent />
                    </JourneyProvider>
                </QueryClientProvider>,
            )

            expect(screen.getByTestId('journeyType')).toHaveTextContent(
                'cart-abandoned',
            )
        })
    })
})
