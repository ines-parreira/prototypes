import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { IntegrationsProvider } from 'AIJourney/providers'
import { appQueryClient } from 'api/queryClient'
import { shopifyProductResult } from 'fixtures/shopify'
import useAllIntegrations from 'hooks/useAllIntegrations'
import { useListProducts } from 'models/integration/queries'
import { renderWithRouter } from 'utils/testing'

import { Test } from './Test'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
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

jest.mock('models/integration/queries')
const useListProductsMock = assumeMock(useListProducts)

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useGetCurrentUser: jest.fn(() => ({
        data: { data: { name: 'Aílton Krenak' } },
    })),
}))

jest.mock('AIJourney/hooks', () => ({
    ...jest.requireActual('AIJourney/hooks'),
    useJourneyUpdateHandler: jest.fn(),
}))

const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
    .useJourneyUpdateHandler as jest.Mock

describe('<Test />', () => {
    const mockStore = configureMockStore([thunk])()
    const mockHandleUpdate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyUpdateHandler.mockImplementation(() => ({
            handleUpdate: mockHandleUpdate,
        }))

        mockUseJourneyContext.mockImplementation(() => ({
            journey: null,
            journeyData: {
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    include_image: true,
                    max_discount_percent: 20,
                    sms_sender_number: '415-111-111',
                    sms_sender_integration_id: 1,
                },
            },
            journeyType: 'cart-abandoned',
            currentIntegration: { id: 1, name: 'shopify-store' },
            shopName: 'shopify-store',
            isLoading: false,
            storeConfiguration: {
                monitoredSmsIntegrations: [],
            },
        }))

        const originalOpen = XMLHttpRequest.prototype.open
        XMLHttpRequest.prototype.open = function (method, url) {
            console.error('XMLHttpRequest called with:', method, url)
            originalOpen.apply(this, arguments as any)
        }

        useListProductsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: shopifyProductResult(),
                        },
                    },
                ],
            },
        } as any)
    })

    it('should render loading state', () => {
        mockUseJourneyContext.mockImplementation(() => ({
            journey: null,
            journeyData: null,
            currentIntegration: undefined,
            shopName: 'shopify-store',
            isLoading: true,
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Test />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should render AI Journey test page', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <Test />
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByText('Preview your abandoned cart messages'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'See the messages your customers would receive if they left something in their cart.',
            ),
        ).toBeInTheDocument()
    })

    it('should redirect to activate page when continue button is clicked', async () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Test />
                </QueryClientProvider>
            </Provider>,
        )

        const user = userEvent.setup()

        const linkElement = screen.getByRole('link', { name: 'Return' })
        expect(linkElement).toHaveAttribute(
            'href',
            '/app/ai-journey/shopify-store/cart-abandoned/setup',
        ) // return button should have correct link

        const button = screen.getByTestId('ai-journey-button')
        await act(async () => {
            await user.click(button)
        })

        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/ai-journey/shopify-store/cart-abandoned/activate',
            )
        })
    })

    it('should update journeyMessageInstructions and products when parameters change', () => {
        const newInstructions = 'New message instructions'

        useListProductsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: [],
                        },
                    },
                ],
            },
        } as any)

        const { rerender } = renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Test />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.queryByText(newInstructions)).not.toBeInTheDocument()
        expect(screen.queryByText('Default Title')).not.toBeInTheDocument()
        expect(screen.queryByText('Strong phone')).not.toBeInTheDocument()

        act(() => {
            mockUseJourneyContext.mockReturnValueOnce({
                currentJourney: { message_instructions: newInstructions },
                journeyData: null,
                currentIntegration: { id: 1, name: 'shopify-store' },
                shopName: 'shopify-store',
                isLoading: false,
            })

            useListProductsMock.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: shopifyProductResult(),
                            },
                        },
                    ],
                },
            } as any)
        })

        rerender(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Test />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByDisplayValue(newInstructions)).toBeInTheDocument()
        expect(screen.getByText('Default Title')).toBeInTheDocument()
        expect(screen.getByText('Strong phone')).toBeInTheDocument()
    })
})
