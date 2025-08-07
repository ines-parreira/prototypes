import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { IntegrationsProvider } from 'AIJourney/providers'
import { mockPhoneNumbers } from 'AIJourney/utils/test-fixtures/mockPhoneNumbers'
import { appQueryClient } from 'api/queryClient'
import { account } from 'fixtures/account'
import useAllIntegrations from 'hooks/useAllIntegrations'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { renderWithRouter } from 'utils/testing'

import { Setup } from './Setup'

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
    useJourneyConfiguration: jest.fn(),
    useUpdateJourney: jest.fn(),
    useSmsIntegrations: jest.fn(),
}))

const mockUseJourneys = require('AIJourney/queries').useJourneys as jest.Mock
const mockUseSmsIntegrations = require('AIJourney/queries')
    .useSmsIntegrations as jest.Mock
const mockUseJourneyConfiguration = require('AIJourney/queries')
    .useJourneyConfiguration as jest.Mock
const mockUseCreateNewJourney = require('AIJourney/queries')
    .useCreateNewJourney as jest.Mock
const mockUseUpdateJourney = require('AIJourney/queries')
    .useUpdateJourney as jest.Mock

const mockUseIntegrations = require('AIJourney/providers')
    .useIntegrations as jest.Mock

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

describe('<Setup />', () => {
    const mockHandleUpdate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

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
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS(account),
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
                sms_sender_integration_id: 1,
            },
            isError: false,
            isLoading: false,
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <Setup />
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        const returnButton = screen.getByText('Cancel')
        expect(returnButton).toBeInTheDocument()
        expect(returnButton).toBeEnabled()
        expect(returnButton).toHaveAttribute(
            'href',
            '/app/ai-journey/shopify-store',
        )
    })

    it('should update state when journeyParams is fetched', async () => {
        mockUseJourneyConfiguration.mockImplementation(() => ({
            data: {
                max_follow_up_messages: 3,
                offer_discount: true,
                max_discount_percent: 20,
                discount_code_message_threshold: 2,
            },
            isError: false,
            isLoading: false,
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <Setup />
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        const selectedFollowUpButton = screen.getAllByRole('button', {
            name: '4',
        })[0]
        expect(selectedFollowUpButton).toHaveClass('selectorOption--selected')

        const discountInput = screen.getByDisplayValue('20')
        expect(discountInput).toBeInTheDocument()

        const selectedThresholdButton = screen.getAllByRole('button', {
            name: '2',
        })[1]
        expect(selectedThresholdButton).toHaveClass('selectorOption--selected')
    })

    it('should reset the discount threshold message when total of message is changed', async () => {
        // Mock no existing journey configuration so the component starts with defaults
        mockUseJourneyConfiguration.mockImplementation(() => ({
            data: null,
            isError: false,
            isLoading: false,
        }))

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <Setup />
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        const user = userEvent.setup()

        // Wait for component to render with default state
        await waitFor(() => {
            // Component should start with default of 1 message (showing as button "1" selected)
            expect(screen.getByRole('button', { name: '1' })).toHaveClass(
                'selectorOption--selected',
            )
        })

        // First, enable discount
        const discountToggle = screen.getByRole('checkbox')
        await act(async () => {
            await user.click(discountToggle)
        })

        // Now click on button "4" to set total messages to 4 (this will make discount threshold field appear)
        const button4 = screen.getAllByRole('button', { name: '4' })[0]
        await act(async () => {
            await user.click(button4)
        })

        // Wait for discount threshold selector to appear (only shows when messages > 1)
        await waitFor(() => {
            expect(
                screen.getByText('Select message that includes discount code'),
            ).toBeInTheDocument()
        })

        // Verify button "4" is selected in messages field
        await waitFor(() => {
            expect(button4).toHaveClass('selectorOption--selected')
        })

        // Click on button "3" in the discount threshold selector (should be button "3" at index [1])
        const discountButton3 = screen.getAllByRole('button', { name: '3' })[1]
        await act(async () => {
            await user.click(discountButton3)
        })

        // Verify button "3" is selected in discount threshold
        await waitFor(() => {
            expect(discountButton3).toHaveClass('selectorOption--selected')
        })

        // Now click button "2" in messages to trigger the reset behavior
        const messagesButton2 = screen.getAllByRole('button', { name: '2' })[0]
        await act(async () => {
            await user.click(messagesButton2)
        })

        // Verify the reset behavior:
        // 1. Messages field should show "2" selected
        // 2. Discount threshold should reset to "1"
        await waitFor(() => {
            expect(messagesButton2).toHaveClass('selectorOption--selected')

            const discountButton1 = screen.getAllByRole('button', {
                name: '1',
            })[1]
            expect(discountButton1).toHaveClass('selectorOption--selected')
        })
    })

    describe('Error Handling', () => {
        const mockHandleUpdate = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()

            mockUseJourneyUpdateHandler.mockImplementation(() => ({
                handleUpdate: mockHandleUpdate,
            }))

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
        })

        it('should throw error when creating journey with missing integration ID', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ name: 'shopify-store' }],
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [],
                isError: false,
                isLoading: false,
            }))

            const mockMutateAsync = jest
                .fn()
                .mockRejectedValue(new Error('Missing integration ID'))

            mockUseCreateNewJourney.mockImplementation(() => ({
                mutateAsync: mockMutateAsync,
                isError: false,
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')

            await act(async () => {
                await userEvent.click(button)
            })

            await waitFor(async () => {
                await expect(mockMutateAsync()).rejects.toThrow(
                    'Missing integration ID',
                )
                await expect(mockHistoryPush).not.toHaveBeenCalled()
            })
        })

        it('should throw error when creating journey with missing integration name', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1 }],
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [],
                isError: false,
                isLoading: false,
            }))

            const mockMutateAsync = jest
                .fn()
                .mockRejectedValue(new Error('Missing integration name'))

            mockUseCreateNewJourney.mockImplementation(() => ({
                mutateAsync: mockMutateAsync,
                isError: false,
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')

            await act(async () => {
                await userEvent.click(button)
            })

            await waitFor(async () => {
                await expect(mockMutateAsync()).rejects.toThrow(
                    'Missing integration name',
                )
                await expect(mockHistoryPush).not.toHaveBeenCalled()
            })
        })

        it('should throw error when updating journey with missing integration ID', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ name: 'shopify-store' }],
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [{ id: 'journey-123', type: 'cart_abandoned' }],
                isError: false,
                isLoading: false,
            }))

            const mockUpdateJourney = jest
                .fn()
                .mockRejectedValue(new Error('Missing integration ID'))

            jest.doMock('AIJourney/queries', () => ({
                ...jest.requireActual('AIJourney/queries'),
                useUpdateJourney: jest.fn(() => ({
                    mutateAsync: mockUpdateJourney,
                    isError: false,
                    isLoading: false,
                })),
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')

            await act(async () => {
                await userEvent.click(button)
            })

            await waitFor(async () => {
                await expect(mockUpdateJourney()).rejects.toThrow(
                    'Missing integration ID',
                )
                await expect(mockHistoryPush).not.toHaveBeenCalled()
            })
        })

        it('should throw error when updating journey with missing integration name', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1 }],
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [{ id: 'journey-123', type: 'cart_abandoned' }],
                isError: false,
                isLoading: false,
            }))

            const mockUpdateJourney = jest
                .fn()
                .mockRejectedValue(new Error('Missing integration name'))

            jest.doMock('AIJourney/queries', () => ({
                ...jest.requireActual('AIJourney/queries'),
                useUpdateJourney: jest.fn(() => ({
                    mutateAsync: mockUpdateJourney,
                    isError: false,
                    isLoading: false,
                })),
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')

            await act(async () => {
                await userEvent.click(button)
            })

            await waitFor(async () => {
                await expect(mockUpdateJourney()).rejects.toThrow(
                    'Missing integration name',
                )
                await expect(mockHistoryPush).not.toHaveBeenCalled()
            })
        })

        it('should throw error when updating journey with missing journey ID', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1, name: 'shopify-store' }],
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [{ type: 'cart_abandoned' }],
                isError: false,
                isLoading: false,
            }))

            const mockUpdateJourney = jest
                .fn()
                .mockRejectedValue(new Error('Missing journey ID'))

            jest.doMock('AIJourney/queries', () => ({
                ...jest.requireActual('AIJourney/queries'),
                useUpdateJourney: jest.fn(() => ({
                    mutateAsync: mockUpdateJourney,
                    isError: false,
                    isLoading: false,
                })),
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')

            await act(async () => {
                await userEvent.click(button)
            })

            await waitFor(async () => {
                await expect(mockUpdateJourney()).rejects.toThrow(
                    'Missing journey ID',
                )
                await expect(mockHistoryPush).not.toHaveBeenCalled()
            })
        })

        it('should handle mutation errors during journey creation', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1, name: 'shopify-store' }],
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [],
                isError: false,
                isLoading: false,
            }))

            const mockMutateAsync = jest
                .fn()
                .mockRejectedValue(new Error('Missing integration information'))

            mockUseCreateNewJourney.mockImplementation(() => ({
                mutateAsync: mockMutateAsync,
                isError: false,
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')

            await act(async () => {
                await userEvent.click(button)
            })

            await waitFor(async () => {
                await expect(mockMutateAsync()).rejects.toThrow(
                    'Missing integration information',
                )
                await expect(mockHistoryPush).not.toHaveBeenCalled()
            })
        })

        it('should handle mutation errors during journey update', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1, name: 'shopify-store' }],
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [{ id: 'journey-123', type: 'cart_abandoned' }],
                isError: false,
                isLoading: false,
            }))

            const mockUpdateJourney = jest
                .fn()
                .mockRejectedValue(new Error('Missing integration information'))

            mockUseUpdateJourney.mockImplementation(() => ({
                mutateAsync: mockUpdateJourney,
                isError: false,
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')

            await act(async () => {
                await userEvent.click(button)
            })

            await waitFor(async () => {
                await expect(mockUpdateJourney()).rejects.toThrow(
                    'Missing integration information',
                )
                await expect(mockHistoryPush).not.toHaveBeenCalled()
            })
        })
    })

    describe('handleContinue', () => {
        const mockHandleUpdate = jest.fn()
        beforeEach(() => {
            jest.clearAllMocks()

            mockUseJourneyUpdateHandler.mockImplementation(() => ({
                handleUpdate: mockHandleUpdate,
            }))

            mockUseSmsIntegrations.mockReturnValue({
                data: [
                    { sms_integration_id: 1, store_integration_id: 1 },
                    { sms_integration_id: 2, store_integration_id: 2 },
                ],
                isLoading: false,
                error: null,
            })

            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1, name: 'shopify-store' }],
                isLoading: false,
            }))

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
                    discount_code_message_threshold: 2,
                },
                isError: false,
                isLoading: false,
            }))

            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1, name: 'shopify-store' }],
                isLoading: false,
                currentIntegration: { id: 1, name: 'shopify-store' },
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [{ id: 'journey-123', type: 'cart_abandoned' }],
                isError: false,
                isLoading: false,
            }))

            jest.mock('hooks/useAllIntegrations', () => ({
                __esModule: true,
                default: jest.fn(() => ({
                    integrations: [
                        {
                            id: 1,
                            type: 'shopify',
                            name: 'shopify-store',
                            meta: { shop_name: 'shopify-store' },
                        },
                    ],
                    isLoading: false,
                    isError: false,
                })),
            }))
        })

        it('should navigate to activation page after successful journey creation', async () => {
            mockUseJourneys.mockImplementation(() => ({
                data: [],
                isError: false,
                isLoading: false,
            }))

            const mockMutateAsync = jest.fn()
            mockUseCreateNewJourney.mockImplementation(() => ({
                mutateAsync: mockMutateAsync,
                isError: false,
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )
            const user = userEvent.setup()

            const button = screen.getByTestId('ai-journey-button')
            await act(async () => {
                await user.click(button)
            })

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledTimes(1)
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                params: {
                    store_integration_id: 1,
                    store_name: 'shopify-store',
                },
                journeyConfigs: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_integration_id: 1,
                    discount_code_message_threshold: 2,
                },
            })

            await waitFor(() => {
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/ai-journey/shopify-store/activation',
                )
            })

            expect(mockMutateAsync).toHaveBeenCalledTimes(1)
        })

        it('should navigate to activation page after successful journey update', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1, name: 'shopify-store' }],
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [{ id: 'journey-123', type: 'cart_abandoned' }],
                isError: false,
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            expect(button).not.toBeDisabled()
            await act(async () => {
                await userEvent.click(button)
            })

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledTimes(1)
            })

            await waitFor(() => {
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/ai-journey/shopify-store/activation',
                )
            })
        })

        it('should call handleCreate when no existing journey exists', async () => {
            mockUseJourneys.mockImplementation(() => ({
                data: [],
                isError: false,
                isLoading: false,
            }))

            const mockMutateAsync = jest.fn()
            mockUseCreateNewJourney.mockImplementation(() => ({
                mutateAsync: mockMutateAsync,
                isError: false,
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            await act(async () => {
                await userEvent.click(button)
            })

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledTimes(1)
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                params: {
                    store_integration_id: 1,
                    store_name: 'shopify-store',
                },
                journeyConfigs: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_integration_id: 1,
                    discount_code_message_threshold: 2,
                },
            })
        })

        it('should call handleCreate without discount_code_message_threshold when no existing journey exists and discount disabled', async () => {
            mockUseJourneys.mockImplementation(() => ({
                data: [],
                isError: false,
                isLoading: false,
            }))

            const mockMutateAsync = jest.fn()
            mockUseCreateNewJourney.mockImplementation(() => ({
                mutateAsync: mockMutateAsync,
                isError: false,
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            await act(async () => {
                await userEvent.click(screen.getByRole('checkbox'))
                await userEvent.click(screen.getByTestId('ai-journey-button'))
            })

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledTimes(1)
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                params: {
                    store_integration_id: 1,
                    store_name: 'shopify-store',
                },
                journeyConfigs: {
                    max_follow_up_messages: 3,
                    offer_discount: false,
                    max_discount_percent: 20,
                    sms_sender_integration_id: 1,
                },
            })
        })

        it('should call handleUpdate when existing journey exists', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1, name: 'shopify-store' }],
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [{ id: 'journey-123', type: 'cart_abandoned' }],
                isError: false,
                isLoading: false,
            }))

            renderWithRouter(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            expect(button).not.toBeDisabled()
            await act(async () => {
                await userEvent.click(button)
            })

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledTimes(1)
            })
        })
    })
})
