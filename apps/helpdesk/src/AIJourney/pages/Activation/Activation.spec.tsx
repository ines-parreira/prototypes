import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { mockPhoneNumbers } from 'AIJourney/utils/test-fixtures/mockPhoneNumbers'
import { appQueryClient } from 'api/queryClient'
import { account } from 'fixtures/account'
import { shopifyProductResult } from 'fixtures/shopify'
import useAllIntegrations from 'hooks/useAllIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import { useListProducts } from 'models/integration/queries'
import { renderWithRouter } from 'utils/testing'

import { Activation } from './Activation'

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

const mockHandleUpdate = jest.fn()
const mockHandleTestSms = jest.fn()
jest.mock('AIJourney/hooks', () => ({
    useJourneyUpdateHandler: jest.fn(() => ({
        handleUpdate: mockHandleUpdate,
    })),
    useHandleSendTestSMS: jest.fn(() => ({
        handleTestSms: mockHandleTestSms,
    })),
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

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

jest.mock('AIJourney/queries', () => ({
    ...jest.requireActual('AIJourney/queries'),
    useCreateNewJourney: jest.fn(),
    useUpdateJourney: jest.fn(),
    useSmsIntegrations: jest.fn(),
}))

const mockUseSmsIntegrations = require('AIJourney/queries')
    .useSmsIntegrations as jest.Mock
const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock
const mockUseCreateNewJourney = require('AIJourney/queries')
    .useCreateNewJourney as jest.Mock
const mockUseUpdateJourney = require('AIJourney/queries')
    .useUpdateJourney as jest.Mock

jest.mock('models/integration/queries')
const useListProductsMock = assumeMock(useListProducts)

jest.mock('hooks/useAppSelector', () => jest.fn())

const mockUseAppSelector = useAppSelector as jest.Mock

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useGetCurrentUser: jest.fn(() => ({
        data: { data: { name: 'Jane Smith' } },
    })),
}))

describe('<Activation />', () => {
    const mockStore = configureMockStore([thunk])()

    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()

        const mockCreateJourneyMutateAsync = jest.fn().mockResolvedValue({})
        const mockUpdateMutateAsync = jest.fn().mockResolvedValue({})

        // Default mock for useJourneyContext
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                id: 'journey-123',
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_number: '415-111-111',
                    sms_sender_integration_id: 1,
                },
            },
            currentIntegration: { id: 1, name: 'shopify-store' },
            shopName: 'shopify-store',
            isLoading: false,
            journeyType: 'cart-abandoned',
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
        })

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

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should redirect from Activation to performance on continue', async () => {
        const user = userEvent.setup()
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                id: 'journey-123',
                type: 'cart_abandoned',
                message_instructions: 'test message instructions',
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_number: '415-111-111',
                    sms_sender_integration_id: 1,
                },
            },
            currentIntegration: { id: 1, name: 'shopify-store' },
            shopName: 'shopify-store',
            isLoading: false,
            journeyType: 'cart-abandoned',
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Activation />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        const input = screen.getByRole('textbox')
        await act(async () => {
            await user.type(input, '1234567890')
        })

        const button = screen.getByTestId('ai-journey-button')
        expect(button).toBeEnabled()

        await act(() => user.click(button))

        await waitFor(
            () => {
                expect(mockHistoryPush).toHaveBeenCalledTimes(1)
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/ai-journey/shopify-store/flows',
                )
            },
            { timeout: 1000 },
        )
        expect(mockHandleUpdate).toHaveBeenCalledWith({
            journeyMessageInstructions: 'test message instructions',
            journeyState: 'active',
        })
    })

    it('should redirect from Activation to campaign on continue', async () => {
        const user = userEvent.setup()
        mockUseJourneyContext.mockReturnValue({
            journeyData: {
                id: 'journey-123',
                type: 'campaign',
                message_instructions: 'test message instructions',
            },
            currentIntegration: { id: 1, name: 'shopify-store' },
            shopName: 'shopify-store',
            isLoading: false,
            journeyType: 'campaign',
            storeConfiguration: {
                monitoredSmsIntegrations: [1, 2],
            },
        })

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Activation />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        const input = screen.getByRole('textbox')
        await act(async () => {
            await user.type(input, '1234567890')
        })

        const button = screen.getByTestId('ai-journey-button')
        expect(button).toBeEnabled()

        await act(() => user.click(button))

        await waitFor(
            () => {
                expect(mockHistoryPush).toHaveBeenCalledTimes(1)
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/ai-journey/shopify-store/campaigns',
                )
            },
            { timeout: 1000 },
        )
        expect(mockHandleUpdate).toHaveBeenCalledWith({
            journeyMessageInstructions: 'test message instructions',
            journeyState: 'active',
        })
    })

    it('should redirect from activation to test step on return', async () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Activation />
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(screen.getByText('Return')).toBeInTheDocument()
        })

        const returnButton = screen.getByText('Return')
        expect(returnButton).toBeInTheDocument()
        expect(returnButton).toBeEnabled()
        expect(returnButton).toHaveAttribute(
            'href',
            '/app/ai-journey/shopify-store/cart-abandoned/test/journey-123',
        )
    })

    it('should render correct user name when available', async () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Activation />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByText('Select an abandoned product'),
        ).toBeInTheDocument()
        expect(
            await screen.findByText(
                'Customer Jane Smith has left their cart with the following product',
            ),
        ).toBeInTheDocument()
    })

    it('should fallback to John Doe when user name is not available', async () => {
        const mockUseGetCurrentUser = require('@gorgias/helpdesk-queries')
            .useGetCurrentUser as jest.Mock
        mockUseGetCurrentUser.mockImplementation(() => ({
            data: { data: { name: undefined } },
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <Activation />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByText('Select an abandoned product'),
        ).toBeInTheDocument()
        expect(
            await screen.findByText(
                'Customer John Doe has left their cart with the following product',
            ),
        ).toBeInTheDocument()
    })

    describe('handleTestSms', () => {
        beforeEach(() => {
            jest.clearAllMocks()
            mockHandleTestSms.mockResolvedValue(undefined)
        })

        it('should call handleTestSms when Send SMS button is clicked', async () => {
            const user = userEvent.setup()
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'journey-123',
                    type: 'cart_abandoned',
                    configuration: {
                        max_follow_up_messages: 3,
                        offer_discount: true,
                        max_discount_percent: 20,
                        sms_sender_number: '415-111-111',
                        sms_sender_integration_id: 1,
                    },
                },
                currentIntegration: { id: 1, name: 'shopify-store' },
                shopName: 'shopify-store',
                isLoading: false,
                journeyType: 'cart-abandoned',
                storeConfiguration: {
                    monitoredSmsIntegrations: [1, 2],
                },
            })

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <Activation />
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            const input = screen.getByRole('textbox')

            await act(async () => {
                await user.type(input, '+12015550123')
            })

            await waitFor(() => {
                expect(screen.getByText('Send SMS')).toBeEnabled()
            })

            const button = screen.getByText('Send SMS')
            await act(() => user.click(button))

            await waitFor(() => {
                expect(mockHandleTestSms).toHaveBeenCalledTimes(1)
            })
        })

        it('should auto-select the first product when products are loaded', async () => {
            const user = userEvent.setup()
            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <Activation />
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(async () => {
                expect(screen.queryAllByText('Black shirt')).toHaveLength(2)
            })

            const input = screen.getByRole('textbox')

            await act(async () => {
                await user.type(input, '+12015550123')
            })

            await waitFor(() => {
                expect(screen.getByText('Send SMS')).toBeEnabled()
            })

            const button = screen.getByText('Send SMS')
            await act(() => user.click(button))

            await waitFor(() => {
                expect(mockHandleTestSms).toHaveBeenCalledTimes(1)
            })
        })

        it('should NOT override existing product selection when products change', async () => {
            const initialProducts = [
                {
                    id: 'product-1',
                    title: 'First Product',
                    image: 'image1.jpg',
                    status: 'active',
                    variants: [{ id: 'variant-1', price: '10.00' }],
                },
            ]

            useListProductsMock.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: initialProducts.map((product) => ({
                                    data: product,
                                })),
                            },
                        },
                    ],
                },
            } as any)

            const { rerender } = renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <Activation />
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(() => {
                expect(screen.getAllByText('First Product')).toHaveLength(2)
            })

            const updatedProducts = [
                ...initialProducts,
                {
                    id: 'product-2',
                    title: 'Second Product',
                    image: 'image2.jpg',
                    status: 'active',
                    variants: [{ id: 'variant-2', price: '20.00' }],
                },
            ]

            useListProductsMock.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: updatedProducts.map((product) => ({
                                    data: product,
                                })),
                            },
                        },
                    ],
                },
            } as any)

            rerender(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <Activation />
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(() => {
                // Should still show first product as selected, not change selection
                expect(screen.getAllByText('First Product')).toHaveLength(2)
                expect(screen.getAllByText('Second Product')).toHaveLength(1)
            })
        })
    })

    describe('Welcome journey', () => {
        beforeEach(() => {
            mockUseJourneyContext.mockReturnValue({
                journeyData: {
                    id: 'journey-123',
                    type: 'welcome',
                    message_instructions: 'Welcome message instructions',
                    configuration: {
                        max_follow_up_messages: 1,
                        offer_discount: false,
                        max_discount_percent: 0,
                        sms_sender_number: '415-111-111',
                        sms_sender_integration_id: 1,
                    },
                },
                currentIntegration: { id: 1, name: 'shopify-store' },
                shopName: 'shopify-store',
                isLoading: false,
                journeyType: 'welcome',
                storeConfiguration: {
                    monitoredSmsIntegrations: [1, 2],
                },
            })
        })

        it('should render returning customer toggle instead of product select', async () => {
            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <Activation />
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(() => {
                expect(
                    screen.getByText('Returning customer'),
                ).toBeInTheDocument()
            })
            expect(
                screen.queryByText('Select an abandoned product'),
            ).not.toBeInTheDocument()
        })

        it('should toggle returning customer when clicked', async () => {
            const user = userEvent.setup()

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <Activation />
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(() => {
                expect(screen.getByRole('checkbox')).toBeInTheDocument()
            })

            const toggle = screen.getByRole('checkbox')
            expect(toggle).not.toBeChecked()

            await user.click(toggle)

            expect(toggle).toBeChecked()
        })
    })
})
