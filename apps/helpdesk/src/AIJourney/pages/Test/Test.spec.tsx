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
    useGeneratePlaygroundMessage: jest.fn(),
}))

const mockUseJourneyUpdateHandler = require('AIJourney/hooks')
    .useJourneyUpdateHandler as jest.Mock

const mockUseGeneratePlaygroundMessage = require('AIJourney/hooks')
    .useGeneratePlaygroundMessage as jest.Mock

describe('<Test />', () => {
    const mockStore = configureMockStore([thunk])()
    const mockHandleUpdate = jest.fn()
    const mockHandleGenerateMessages = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyUpdateHandler.mockImplementation(() => ({
            handleUpdate: mockHandleUpdate,
        }))

        mockUseGeneratePlaygroundMessage.mockImplementation(() => ({
            handleGenerateMessages: mockHandleGenerateMessages,
            playgroundMessages: [],
            isGeneratingMessages: false,
        }))

        mockUseJourneyContext.mockImplementation(() => ({
            journey: null,
            journeyData: {
                id: 'journey-123',
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
            '/app/ai-journey/shopify-store/cart-abandoned/setup/journey-123',
        ) // return button should have correct link

        const button = screen.getByTestId('ai-journey-button')
        await act(async () => {
            await user.click(button)
        })

        await waitFor(() => {
            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/ai-journey/shopify-store/cart-abandoned/activate/journey-123',
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
            mockUseJourneyContext.mockReturnValue({
                journeyData: { message_instructions: newInstructions },
                currentIntegration: { id: 1, name: 'shopify-store' },
                shopName: 'shopify-store',
                isLoading: false,
                journeyType: 'cart-abandoned',
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

    it('should show error when continue button is clicked without message instructions for campaign journey type', async () => {
        mockUseJourneyContext.mockImplementation(() => ({
            journey: null,
            journeyData: {
                id: 'journey-123',
                type: 'campaign',
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    include_image: true,
                    max_discount_percent: 20,
                    sms_sender_number: '415-111-111',
                    sms_sender_integration_id: 1,
                },
            },
            journeyType: 'campaign',
            currentIntegration: { id: 1, name: 'shopify-store' },
            shopName: 'shopify-store',
            isLoading: false,
            storeConfiguration: {
                monitoredSmsIntegrations: [],
            },
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Test />
                </QueryClientProvider>
            </Provider>,
        )

        const user = userEvent.setup()

        const continueButton = screen.getByTestId('ai-journey-button')
        await act(async () => {
            await user.click(continueButton)
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Please provide message guidance to continue.',
                ),
            ).toBeInTheDocument()
        })

        expect(mockHistoryPush).not.toHaveBeenCalled()
    })

    it('should show error when preview messages button is clicked without message instructions for campaign journey type', async () => {
        mockUseJourneyContext.mockImplementation(() => ({
            journey: null,
            journeyData: {
                id: 'journey-123',
                type: 'campaign',
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    include_image: true,
                    max_discount_percent: 20,
                    sms_sender_number: '415-111-111',
                    sms_sender_integration_id: 1,
                },
            },
            journeyType: 'campaign',
            currentIntegration: { id: 1, name: 'shopify-store' },
            shopName: 'shopify-store',
            isLoading: false,
            storeConfiguration: {
                monitoredSmsIntegrations: [],
            },
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Test />
                </QueryClientProvider>
            </Provider>,
        )

        const user = userEvent.setup()

        const previewButton = screen.getByRole('button', {
            name: 'Preview messages',
        })
        await act(async () => {
            await user.click(previewButton)
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    'Please provide message guidance to continue.',
                ),
            ).toBeInTheDocument()
        })

        expect(mockHandleGenerateMessages).not.toHaveBeenCalled()
    })

    it('should call handleGenerateMessages when preview messages button is clicked with valid instructions', async () => {
        mockUseJourneyContext.mockImplementation(() => ({
            journey: null,
            journeyData: {
                id: 'journey-123',
                type: 'campaign',
                message_instructions: 'Test instructions',
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    include_image: true,
                    max_discount_percent: 20,
                    sms_sender_number: '415-111-111',
                    sms_sender_integration_id: 1,
                },
            },
            journeyType: 'campaign',
            currentIntegration: { id: 1, name: 'shopify-store' },
            shopName: 'shopify-store',
            isLoading: false,
            storeConfiguration: {
                monitoredSmsIntegrations: [],
            },
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Test />
                </QueryClientProvider>
            </Provider>,
        )

        const user = userEvent.setup()

        const previewButton = screen.getByRole('button', {
            name: 'Preview messages',
        })
        await act(async () => {
            await user.click(previewButton)
        })

        await waitFor(() => {
            expect(mockHandleGenerateMessages).toHaveBeenCalledTimes(1)
        })
    })

    it('should preserve product image when generating messages', async () => {
        const firstProductImage = {
            src: 'https://example.com/image1.jpg',
        }

        const mockProducts = [
            {
                id: 1,
                integration_id: 1,
                integration_type: 'shopify',
                item_type: 'product',
                data: {
                    id: 1,
                    title: 'Product 1',
                    image: firstProductImage,
                    status: 'active',
                    variants: [
                        {
                            id: 1,
                            title: 'Default',
                            price: '10.00',
                        },
                    ],
                },
            },
            {
                id: 2,
                integration_id: 1,
                integration_type: 'shopify',
                item_type: 'product',
                data: {
                    id: 2,
                    title: 'Product 2',
                    image: { src: 'https://example.com/image2.jpg' },
                    status: 'active',
                    variants: [
                        {
                            id: 2,
                            title: 'Default',
                            price: '20.00',
                        },
                    ],
                },
            },
        ]

        useListProductsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data: {
                            data: mockProducts,
                        },
                    },
                ],
            },
        } as any)

        const mockPlaygroundMessages = ['Message 1', 'Message 2']
        mockUseGeneratePlaygroundMessage.mockImplementation(() => ({
            handleGenerateMessages: mockHandleGenerateMessages,
            playgroundMessages: mockPlaygroundMessages,
            isGeneratingMessages: false,
        }))

        mockUseJourneyContext.mockImplementation(() => ({
            journey: null,
            journeyData: {
                id: 'journey-123',
                type: 'cart-abandoned',
                message_instructions: 'Test instructions',
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

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Test />
                </QueryClientProvider>
            </Provider>,
        )

        const user = userEvent.setup()

        const previewButton = screen.getByRole('button', {
            name: 'Preview messages',
        })

        await act(async () => {
            await user.click(previewButton)
        })

        await waitFor(() => {
            expect(mockHandleGenerateMessages).toHaveBeenCalledTimes(1)
        })

        await waitFor(() => {
            const productImage = screen.getByAltText(
                'selected-product-image',
            ) as HTMLImageElement
            expect(productImage).toBeInTheDocument()
            expect(productImage.src).toBe(firstProductImage.src)
        })
    })

    it('should handle preview messages when product is null', async () => {
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

        const mockPlaygroundMessages = ['Message 1', 'Message 2']
        mockUseGeneratePlaygroundMessage.mockImplementation(() => ({
            handleGenerateMessages: mockHandleGenerateMessages,
            playgroundMessages: mockPlaygroundMessages,
            isGeneratingMessages: false,
        }))

        mockUseJourneyContext.mockImplementation(() => ({
            journey: null,
            journeyData: {
                id: 'journey-123',
                type: 'campaign',
                message_instructions: 'Test instructions',
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    include_image: true,
                    max_discount_percent: 20,
                    sms_sender_number: '415-111-111',
                    sms_sender_integration_id: 1,
                },
            },
            journeyType: 'campaign',
            currentIntegration: { id: 1, name: 'shopify-store' },
            shopName: 'shopify-store',
            isLoading: false,
            storeConfiguration: {
                monitoredSmsIntegrations: [],
            },
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Test />
                </QueryClientProvider>
            </Provider>,
        )

        const user = userEvent.setup()

        const previewButton = screen.getByRole('button', {
            name: 'Preview messages',
        })

        await act(async () => {
            await user.click(previewButton)
        })

        await waitFor(() => {
            expect(mockHandleGenerateMessages).toHaveBeenCalledTimes(1)
        })

        expect(
            screen.queryByAltText('selected-product-image'),
        ).not.toBeInTheDocument()
    })

    describe('Campaign journey image', () => {
        const campaignImageUrl = 'https://example.com/campaign-image.jpg'
        const campaignImageName = 'campaign-image.jpg'

        beforeEach(() => {
            mockUseGeneratePlaygroundMessage.mockImplementation(() => ({
                handleGenerateMessages: mockHandleGenerateMessages,
                playgroundMessages: ['Preview message text'],
                isGeneratingMessages: false,
            }))

            mockUseJourneyContext.mockImplementation(() => ({
                journey: null,
                journeyData: {
                    id: 'journey-123',
                    type: 'campaign',
                    message_instructions: 'Campaign instructions',
                    configuration: {
                        max_follow_up_messages: 1,
                        include_image: false,
                        media_urls: [
                            {
                                url: campaignImageUrl,
                                name: campaignImageName,
                                content_type: 'image/jpeg',
                            },
                        ],
                    },
                },
                journeyType: 'campaign',
                currentIntegration: { id: 1, name: 'shopify-store' },
                shopName: 'shopify-store',
                isLoading: false,
                storeConfiguration: { monitoredSmsIntegrations: [] },
            }))
        })

        it('should show campaign image when media_urls is provided', () => {
            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <Test />
                    </QueryClientProvider>
                </Provider>,
            )

            const campaignImage = screen.getByAltText(
                campaignImageName,
            ) as HTMLImageElement
            expect(campaignImage).toBeInTheDocument()
            expect(campaignImage.src).toBe(campaignImageUrl)
        })

        it('should not show campaign image when media_urls is empty', () => {
            mockUseJourneyContext.mockImplementation(() => ({
                journey: null,
                journeyData: {
                    id: 'journey-123',
                    type: 'campaign',
                    message_instructions: 'Campaign instructions',
                    configuration: {
                        max_follow_up_messages: 1,
                        include_image: false,
                        media_urls: [],
                    },
                },
                journeyType: 'campaign',
                currentIntegration: { id: 1, name: 'shopify-store' },
                shopName: 'shopify-store',
                isLoading: false,
                storeConfiguration: { monitoredSmsIntegrations: [] },
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <Test />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.queryByAltText('selected-product-image'),
            ).not.toBeInTheDocument()
        })

        it('should not show campaign image when media_urls is not present in configuration', () => {
            mockUseJourneyContext.mockImplementation(() => ({
                journey: null,
                journeyData: {
                    id: 'journey-123',
                    type: 'campaign',
                    message_instructions: 'Campaign instructions',
                    configuration: {
                        max_follow_up_messages: 1,
                        include_image: false,
                    },
                },
                journeyType: 'campaign',
                currentIntegration: { id: 1, name: 'shopify-store' },
                shopName: 'shopify-store',
                isLoading: false,
                storeConfiguration: { monitoredSmsIntegrations: [] },
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <Test />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.queryByAltText('selected-product-image'),
            ).not.toBeInTheDocument()
        })

        it('should not show a product image for a campaign journey even when includeImage is enabled', () => {
            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <Test />
                    </QueryClientProvider>
                </Provider>,
            )

            const images = screen.getAllByRole('img')
            const campaignImage = images.find(
                (img) => img.getAttribute('alt') === campaignImageName,
            ) as HTMLImageElement
            expect(campaignImage.src).toBe(campaignImageUrl)

            const productImage = images.find(
                (img) => img.getAttribute('alt') === 'selected-product-image',
            )
            expect(productImage).toBeUndefined()
        })
    })

    describe('Welcome journey', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockImplementation(() => ({
                journey: null,
                journeyData: {
                    id: 'journey-123',
                    type: 'welcome',
                    message_instructions: 'Welcome message instructions',
                    configuration: {
                        max_follow_up_messages: 1,
                        offer_discount: false,
                        include_image: false,
                        max_discount_percent: 0,
                        sms_sender_number: '415-111-111',
                        sms_sender_integration_id: 1,
                    },
                },
                journeyType: 'welcome',
                currentIntegration: { id: 1, name: 'shopify-store' },
                shopName: 'shopify-store',
                isLoading: false,
                storeConfiguration: {
                    monitoredSmsIntegrations: [],
                },
            }))
        })

        it('should render returning customer toggle instead of product select', () => {
            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <Test />
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.getByText('Preview your welcome messages'),
            ).toBeInTheDocument()
            expect(screen.getByText('Returning customer')).toBeInTheDocument()
            expect(
                screen.queryByText('Select an abandoned product'),
            ).not.toBeInTheDocument()
        })

        it('should toggle returning customer when clicked', async () => {
            const user = userEvent.setup()

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <Test />
                    </QueryClientProvider>
                </Provider>,
            )

            const toggle = screen.getByRole('checkbox')
            expect(toggle).not.toBeChecked()

            await user.click(toggle)

            expect(toggle).toBeChecked()
        })
    })
})
