import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationsProvider } from 'AIJourney/providers'
import { mockPhoneNumbers } from 'AIJourney/utils/test-fixtures/mockPhoneNumbers'
import { appQueryClient } from 'api/queryClient'
import { shopifyProductResult } from 'fixtures/shopify'
import useAppSelector from 'hooks/useAppSelector'
import { useListProducts } from 'models/integration/queries'
import { NotificationStatus } from 'state/notifications/types'
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

jest.mock('AIJourney/hooks', () => ({
    useJourneyUpdateHandler: jest.fn(() => ({
        handleUpdate: jest.fn().mockResolvedValueOnce(undefined), // Mock it to resolve
    })),
}))

jest.mock('AIJourney/providers', () => ({
    ...jest.requireActual('AIJourney/providers'),
    useIntegrations: jest.fn(),
}))

jest.mock('AIJourney/queries', () => ({
    ...jest.requireActual('AIJourney/queries'),
    useJourneys: jest.fn(),
    useCreateNewJourney: jest.fn(),
    useJourneyConfiguration: jest.fn(),
    useUpdateJourney: jest.fn(),
    useSmsIntegrations: jest.fn(),
    useTestSms: jest.fn(),
}))

const mockUseJourneys = require('AIJourney/queries').useJourneys as jest.Mock
const mockUseSmsIntegrations = require('AIJourney/queries')
    .useSmsIntegrations as jest.Mock
const mockUseJourneyConfiguration = require('AIJourney/queries')
    .useJourneyConfiguration as jest.Mock
const mockUseIntegrations = require('AIJourney/providers')
    .useIntegrations as jest.Mock
const mockUseCreateNewJourney = require('AIJourney/queries')
    .useCreateNewJourney as jest.Mock
const mockUseUpdateJourney = require('AIJourney/queries')
    .useUpdateJourney as jest.Mock
const mockuseTestSms = require('AIJourney/queries').useTestSms as jest.Mock

jest.mock('models/integration/queries')
const useListProductsMock = assumeMock(useListProducts)

jest.mock('hooks/useAppSelector', () => jest.fn())

const mockUseAppSelector = useAppSelector as jest.Mock

describe('<Activation />', () => {
    const mockStore = configureMockStore([thunk])()

    beforeEach(() => {
        jest.clearAllMocks()

        const mockCreateJourneyMutateAsync = jest.fn().mockResolvedValue({})
        const mockUpdateMutateAsync = jest.fn().mockResolvedValue({})
        const mockTestSmsMutateAsync = jest.fn().mockResolvedValue({})

        mockUseJourneys.mockImplementation(() => ({
            data: [],
            isError: false,
            isLoading: false,
        }))

        mockUseIntegrations.mockImplementation(() => ({
            integrations: [{ id: 1, name: 'shopify-store' }],
            isLoading: false,
        }))

        mockUseAppSelector.mockReturnValue({
            '1': mockPhoneNumbers['1'],
            '2': {
                ...mockPhoneNumbers['2'],
                name: 'Regular Phone 2',
            },
        })

        mockUseSmsIntegrations.mockReturnValue({
            data: [
                { sms_integration_id: 'sms-1', store_integration_id: 1 },
                { sms_integration_id: 'sms-2', store_integration_id: 2 },
            ],
            isLoading: false,
            error: null,
        })

        mockUseJourneyConfiguration.mockImplementation(() => ({
            data: {
                max_follow_up_messages: 3,
                offer_discount: true,
                max_discount_percent: 20,
                sms_sender_number: '415-111-111',
                sms_sender_integration_id: 'sms-1',
            },
            isError: false,
            isLoading: false,
        }))

        mockUseCreateNewJourney.mockImplementation(() => ({
            mutateAsync: mockCreateJourneyMutateAsync,
            isError: false,
            isLoading: false,
        }))

        mockuseTestSms.mockImplementation(() => ({
            mutateAsync: mockTestSmsMutateAsync,
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
        mockUseJourneys.mockImplementation(() => ({
            data: [],
            isError: false,
            isLoading: false,
        }))

        mockUseIntegrations.mockImplementation(() => ({
            integrations: [{ id: 1, name: 'shopify-store' }],
            isLoading: false,
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <Activation />
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(screen.getByRole('textbox')).toBeInTheDocument()
        })

        const input = screen.getByRole('textbox')
        await act(async () => {
            await userEvent.type(input, '1234567890')
        })

        const button = screen.getByTestId('ai-journey-button')
        expect(button).toBeEnabled()

        await act(async () => {
            await userEvent.click(button)
        })

        await waitFor(
            () => {
                expect(mockHistoryPush).toHaveBeenCalledTimes(1)
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/ai-journey/shopify-store/performance',
                )
            },
            { timeout: 1000 },
        )
    })

    it('should redirect from conversation setup to landing page on return', async () => {
        mockUseJourneys.mockImplementation(() => ({
            data: [],
            isError: false,
            isLoading: false,
        }))

        mockUseIntegrations.mockImplementation(() => ({
            integrations: [{ id: 1, name: 'shopify-store' }],
            isLoading: false,
        }))

        mockUseJourneyConfiguration.mockImplementation(() => ({
            data: {
                max_follow_up_messages: 3,
                offer_discount: true,
                max_discount_percent: 20,
                sms_sender_number: '(415)-111-111',
                sms_sender_integration_id: 'sms-1',
            },
            isError: false,
            isLoading: false,
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <Activation />
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(screen.getByText('Back')).toBeInTheDocument()
        })

        const returnButton = screen.getByText('Back')
        expect(returnButton).toBeInTheDocument()
        expect(returnButton).toBeEnabled()
        expect(returnButton).toHaveAttribute(
            'href',
            '/app/ai-journey/shopify-store/conversation-setup',
        )
    })

    describe('handleTestSms', () => {
        const mockDispatch = jest.fn()
        const mockNotifyAction = { type: 'NOTIFY_ACTION' }
        const mockNotify = jest.fn().mockReturnValue(mockNotifyAction)
        const mockTestSmsMutateAsync = jest.fn().mockResolvedValue({})

        beforeEach(() => {
            jest.clearAllMocks()
            jest.spyOn(
                require('hooks/useAppDispatch'),
                'default',
            ).mockReturnValue(mockDispatch)

            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1, name: 'shopify-store' }],
                isLoading: false,
            }))

            jest.spyOn(
                require('state/notifications/actions'),
                'notify',
            ).mockImplementation(mockNotify)

            mockUseJourneys.mockImplementation(() => ({
                data: [{ id: 'journey-123', type: 'cart_abandoned' }],
                isError: false,
                isLoading: false,
            }))

            mockuseTestSms.mockImplementation(() => ({
                mutateAsync: mockTestSmsMutateAsync,
                isError: false,
                isLoading: false,
            }))
        })

        afterEach(() => {
            jest.clearAllMocks()
        })

        it('should show error notification when journey ID is missing', async () => {
            mockUseJourneys.mockImplementation(() => ({
                data: [{ type: 'cart_abandoned' }], // missing id
                isError: false,
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Activation />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            const input = screen.getByRole('textbox')
            const button = screen.getByText('Send test SMS')
            await act(async () => {
                await userEvent.type(input, '1234567890')
                expect(button).toBeEnabled()
                await userEvent.click(button)
            })
            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledTimes(1)
            })
        })

        it('should show error notification when testSms mutation fails', async () => {
            const mockTestSmsMutateAsync = jest.fn().mockImplementation(() => {
                return Promise.reject(new Error('SMS service unavailable'))
            })

            mockuseTestSms.mockImplementation(() => ({
                mutateAsync: mockTestSmsMutateAsync,
                isError: false,
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Activation />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            const input = screen.getByRole('textbox')
            const button = screen.getByText('Send test SMS')

            await act(async () => {
                await userEvent.type(input, '1234567890')
                expect(button).toBeEnabled()
                await userEvent.click(button)
            })

            await waitFor(() => {
                expect(mockTestSmsMutateAsync).toHaveBeenCalledTimes(1)
            })

            await waitFor(() => {
                expect(mockNotify).toHaveBeenCalledWith({
                    message: 'Could not send test SMS',
                    status: 'error',
                })
            })

            expect(mockDispatch).toHaveBeenCalledWith(mockNotifyAction)
        })

        it('should successfully send test SMS when all conditions are met', async () => {
            const mockTestSmsMutateAsync = jest.fn().mockResolvedValue({})
            mockuseTestSms.mockImplementation(() => ({
                mutateAsync: mockTestSmsMutateAsync,
                isError: false,
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Activation />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(async () => {
                expect(screen.queryAllByText('Strong phone')).toHaveLength(1)
            })

            await act(async () => {
                await userEvent.click(screen.getByText('Strong phone'))
            })

            const input = screen.getByRole('textbox')
            const button = screen.getByText('Send test SMS')

            await act(async () => {
                await userEvent.type(input, '1234567890')
                expect(button).toBeEnabled()
                await userEvent.click(button)
            })

            expect(mockDispatch).toHaveBeenCalledTimes(1)
            expect(mockTestSmsMutateAsync).toHaveBeenCalledTimes(1)

            expect(mockTestSmsMutateAsync).toHaveBeenCalledWith({
                phoneNumber: '+11234567890',
                journeyId: 'journey-123',
                product: {
                    product_id: '6694863569105',
                    variant_id: '39924461306065',
                    price: 3310,
                },
            })
        })

        it('should auto-select the first product when products are loaded', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                currentIntegration: { id: 1, name: 'shopify-store' },
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Activation />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(async () => {
                expect(screen.queryAllByText('Black shirt')).toHaveLength(2) // one in the display, other in the list
            })

            const input = screen.getByRole('textbox')
            const button = screen.getByText('Send test SMS')

            await act(async () => {
                await userEvent.type(input, '1234567890')
                expect(button).toBeEnabled()
                await userEvent.click(button)
            })

            expect(mockDispatch).toHaveBeenCalledTimes(1)
            expect(mockTestSmsMutateAsync).toHaveBeenCalledTimes(1)

            expect(mockTestSmsMutateAsync).toHaveBeenCalledWith({
                phoneNumber: '+11234567890',
                journeyId: 'journey-123',
                product: {
                    price: 25,
                    product_id: '1',
                    variant_id: '39923189874897',
                },
            })
        })

        it('should show error notification when no journey is available', async () => {
            const mockDispatch = jest.fn()
            const mockNotifyAction = { type: 'NOTIFY_ACTION' }
            const mockNotify = jest.fn().mockReturnValue(mockNotifyAction)

            jest.spyOn(
                require('hooks/useAppDispatch'),
                'default',
            ).mockReturnValue(mockDispatch)

            jest.spyOn(
                require('state/notifications/actions'),
                'notify',
            ).mockImplementation(mockNotify)

            mockUseJourneys.mockImplementation(() => ({
                data: [],
                isError: false,
                isLoading: false,
            }))

            mockUseIntegrations.mockImplementation(() => ({
                currentIntegration: { id: 1, name: 'shopify-store' },
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Activation />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            const input = screen.getByRole('textbox')
            const button = screen.getByText('Send test SMS')

            await act(async () => {
                await userEvent.type(input, '1234567890')
                expect(button).toBeEnabled()
                await userEvent.click(button)
            })

            await waitFor(() => {
                expect(mockNotify).toHaveBeenCalledWith({
                    message:
                        'Missing information: test number: (123) 456-7890, journeyID: undefined',
                    status: NotificationStatus.Error,
                })
                expect(mockDispatch).toHaveBeenCalledWith(mockNotifyAction)
            })
        })

        it('should show error notification when no product is selected', async () => {
            const mockDispatch = jest.fn()
            const mockNotifyAction = { type: 'NOTIFY_ACTION' }
            const mockNotify = jest.fn().mockReturnValue(mockNotifyAction)

            jest.spyOn(
                require('hooks/useAppDispatch'),
                'default',
            ).mockReturnValue(mockDispatch)

            jest.spyOn(
                require('state/notifications/actions'),
                'notify',
            ).mockImplementation(mockNotify)

            // Mock empty products list so no product gets auto-selected
            useListProductsMock.mockReturnValue({
                data: {
                    pages: [{ data: { data: [] } }],
                },
            } as any)

            mockUseJourneys.mockImplementation(() => ({
                data: [{ id: 'journey-123', type: 'cart_abandoned' }],
                isError: false,
                isLoading: false,
            }))

            mockUseIntegrations.mockImplementation(() => ({
                currentIntegration: { id: 1, name: 'shopify-store' },
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Activation />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(() => {
                expect(screen.getByRole('textbox')).toBeInTheDocument()
            })

            const input = screen.getByRole('textbox')
            const button = screen.getByText('Send test SMS')

            await act(async () => {
                await userEvent.type(input, '1234567890')
                expect(button).toBeEnabled()
                await userEvent.click(button)
            })

            await waitFor(() => {
                expect(mockNotify).toHaveBeenCalledWith({
                    message: 'Please select a product',
                    status: NotificationStatus.Error,
                })
                expect(mockDispatch).toHaveBeenCalledWith(mockNotifyAction)
            })
        })

        it('should NOT override existing product selection when products change', async () => {
            const initialProducts = [
                {
                    id: 'product-1',
                    title: 'First Product',
                    image: 'image1.jpg',
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
                        <IntegrationsProvider>
                            <Activation />
                        </IntegrationsProvider>
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
                        <IntegrationsProvider>
                            <Activation />
                        </IntegrationsProvider>
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
})
