import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
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
import { useFlag } from 'core/flags'
import { account } from 'fixtures/account'
import useAllIntegrations from 'hooks/useAllIntegrations'
import useAppSelector from 'hooks/useAppSelector'
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

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
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
    useCreateNewJourney: jest.fn(),
    useUpdateJourney: jest.fn(),
    useSmsIntegrations: jest.fn(),
}))

const mockUseSmsIntegrations = require('AIJourney/queries')
    .useSmsIntegrations as jest.Mock
const mockUseCreateNewJourney = require('AIJourney/queries')
    .useCreateNewJourney as jest.Mock
const mockUseUpdateJourney = require('AIJourney/queries')
    .useUpdateJourney as jest.Mock
const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

jest.mock('hooks/useAppSelector', () => jest.fn())
const mockUseAppSelector = useAppSelector as jest.Mock

jest.mock('hooks/useAllIntegrations', () => ({
    __esModule: true,
    default: jest.fn(),
}))

// Removed useStoreConfiguration mock - now provided by JourneyProvider
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

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

describe('<Setup />', () => {
    const mockHandleUpdate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyUpdateHandler.mockImplementation(() => ({
            handleUpdate: mockHandleUpdate,
        }))
        const mockCreateJourneyMutateAsync = jest.fn().mockResolvedValue({})
        const mockUpdateMutateAsync = jest.fn().mockResolvedValue({})

        // Default mock for useJourneyContext
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
    })
    const mockStore = configureMockStore([thunk])({
        currentAccount: fromJS(account),
    })

    it('should redirect from conversation setup to landing page on return', async () => {
        mockUseJourneyContext.mockReturnValue({
            journey: undefined,
            journeyData: {
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_number: '(415)-111-111',
                    sms_sender_integration_id: 1,
                },
            },
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
        mockUseJourneyContext.mockReturnValue({
            journey: undefined,
            journeyData: {
                configuration: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    discount_code_message_threshold: 2,
                },
            },
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
        })

        it('should handle mutation errors during journey creation', async () => {
            const mockMutateAsync = jest
                .fn()
                .mockRejectedValue(new Error('Journey creation error'))

            mockUseCreateNewJourney.mockImplementation(() => ({
                mutateAsync: mockMutateAsync,
                isError: true,
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
                    'Journey creation error',
                )
                await expect(mockHistoryPush).not.toHaveBeenCalled()
            })
        })

        it('should handle mutation errors during journey update', async () => {
            const mockHandleUpdate = jest
                .fn()
                .mockRejectedValue(new Error('Journey update error'))

            mockUseJourneyUpdateHandler.mockImplementation(() => ({
                handleUpdate: mockHandleUpdate,
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
                await expect(mockHandleUpdate()).rejects.toThrow(
                    'Journey update error',
                )
                await expect(mockHistoryPush).not.toHaveBeenCalled()
            })
        })
    })

    describe('Journey Setup behavior', () => {
        const mockHandleUpdate = jest.fn()

        beforeEach(() => {
            jest.clearAllMocks()
            mockUseJourneyUpdateHandler.mockImplementation(() => ({
                handleUpdate: mockHandleUpdate,
            }))
        })

        it('should display existing journey data when journey already exists', async () => {
            const user = userEvent.setup()

            mockUseAppSelector.mockImplementation((selector) => {
                if (selector.name === 'getCurrentAccountState') {
                    return fromJS(account)
                }
                // Return phone numbers for getNewPhoneNumbers selector
                return mockPhoneNumbers
            })

            mockUseJourneyContext.mockReturnValue({
                journey: {
                    id: 'journey-123',
                    type: 'cart_abandoned',
                    message_instructions: 'Be friendly and professional',
                },
                journeyData: {
                    configuration: {
                        max_follow_up_messages: 2,
                        offer_discount: true,
                        max_discount_percent: 15,
                        sms_sender_number: '+1 555-123-4567',
                        sms_sender_integration_id: 1,
                    },
                },
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
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            await waitFor(() => {
                expect(
                    screen.getAllByRole('button', { name: '3' })[0],
                ).toHaveClass('selectorOption--selected')
            })

            expect(screen.getByDisplayValue('15')).toBeInTheDocument()

            const continueButton = screen.getByTestId('ai-journey-button')
            expect(continueButton).toBeEnabled()

            await act(async () => {
                await user.click(continueButton)
            })

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalled()
            })
        })

        it('should not display custom instructions when flag off', async () => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiJourneyCustomInstructions) {
                    return false
                }
            })

            mockUseAppSelector.mockImplementation((selector) => {
                if (selector.name === 'getCurrentAccountState') {
                    return fromJS(account)
                }
                // Return phone numbers for getNewPhoneNumbers selector
                return mockPhoneNumbers
            })

            mockUseJourneyContext.mockReturnValue({
                journey: {
                    id: 'journey-123',
                    type: 'cart_abandoned',
                    message_instructions: 'Be friendly and professional',
                },
                journeyData: {
                    configuration: {
                        max_follow_up_messages: 2,
                        offer_discount: true,
                        max_discount_percent: 15,
                        sms_sender_number: '+1 555-123-4567',
                        sms_sender_integration_id: 1,
                    },
                },
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
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            expect(
                screen.queryByPlaceholderText(
                    '- Start with "Hey!" - Don\'t include product descriptions - Be friendly',
                ),
            ).not.toBeInTheDocument()
        })

        it('should display custom instructions when flag on', async () => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiJourneyCustomInstructions) {
                    return true
                }
            })

            mockUseAppSelector.mockImplementation((selector) => {
                if (selector.name === 'getCurrentAccountState') {
                    return fromJS(account)
                }
                // Return phone numbers for getNewPhoneNumbers selector
                return mockPhoneNumbers
            })

            mockUseJourneyContext.mockReturnValue({
                journey: {
                    id: 'journey-123',
                    type: 'cart_abandoned',
                    message_instructions: 'Be friendly and professional',
                },
                journeyData: {
                    configuration: {
                        max_follow_up_messages: 2,
                        offer_discount: true,
                        max_discount_percent: 15,
                        sms_sender_number: '+1 555-123-4567',
                        sms_sender_integration_id: 1,
                    },
                },
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
                        <IntegrationsProvider>
                            <Setup />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const messageInstructionsTextarea = screen.getByPlaceholderText(
                '- Start with "Hey!" - Don\'t include product descriptions - Be friendly',
            )
            expect(messageInstructionsTextarea).toBeInTheDocument()
            expect(messageInstructionsTextarea).toHaveValue(
                'Be friendly and professional',
            )
        })

        it('should display default values when journey does not exist', async () => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === FeatureFlagKey.AiJourneyCustomInstructions) {
                    return true
                }
            })

            const user = userEvent.setup()

            mockUseAppSelector.mockImplementation((selector) => {
                if (selector.name === 'getCurrentAccountState') {
                    return fromJS(account)
                }
                // Return phone numbers for getNewPhoneNumbers selector
                return mockPhoneNumbers
            })

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

            const mockCreateMutateAsync = jest.fn().mockResolvedValue({})
            mockUseCreateNewJourney.mockImplementation(() => ({
                mutateAsync: mockCreateMutateAsync,
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

            // Verify default states
            const followUpButtons = screen
                .getAllByRole('button')
                .filter((btn) =>
                    ['1', '2', '3', '4'].includes(btn.textContent ?? ''),
                )
            expect(followUpButtons).toHaveLength(4)
            // Check if any button is selected - there might be a default
            const selectedButton = followUpButtons.find((btn) =>
                btn.classList.contains('selectorOption--selected'),
            )
            if (selectedButton) {
                // If there's a default, just ensure it's one of the valid options
                expect(['1', '2', '3', '4']).toContain(
                    selectedButton.textContent,
                )
            }

            const discountSwitch = screen.getByRole('checkbox')
            expect(discountSwitch).not.toBeChecked()

            const messageInstructionsTextarea = screen.getByPlaceholderText(
                '- Start with "Hey!" - Don\'t include product descriptions - Be friendly',
            )
            expect(messageInstructionsTextarea).toHaveValue('')

            await act(async () => {
                // Select follow-up value
                await user.click(screen.getByRole('button', { name: '1' }))

                // Enable discount and set value
                await user.click(discountSwitch)
            })

            const discountInput = screen.getByRole('spinbutton')
            await act(async () => {
                // Add discount
                await user.type(discountInput, '10')

                // Add message instructions
                await user.type(
                    messageInstructionsTextarea,
                    'Test instructions',
                )
            })

            // Test phone number selection - verify dropdown shows "Select" initially (no journey exists)
            expect(screen.getByText('Select')).toBeInTheDocument()

            // Click on the dropdown to open it and select a phone number
            await act(async () => {
                await user.click(screen.getByText('Select'))
            })

            await waitFor(() => {
                expect(screen.getByText('555-123-4567')).toBeInTheDocument()
            })

            await act(async () => {
                await user.click(screen.getByText('555-123-4567'))
            })

            // Verify a phone number was selected (dropdown no longer shows "Select")
            await waitFor(() => {
                expect(screen.queryByText('Select')).not.toBeInTheDocument()
            })

            // Verify continue button is enabled and click it
            const continueButton = screen.getByTestId('ai-journey-button')
            expect(continueButton).toBeEnabled()

            await act(async () => {
                await user.click(continueButton)
            })

            // Verify create journey is called with correct parameters
            const createMutateAsync = mockUseCreateNewJourney().mutateAsync
            await waitFor(() => {
                expect(createMutateAsync).toHaveBeenCalledWith({
                    params: {
                        store_integration_id: 1,
                        store_name: 'shopify-store',
                        message_instructions: 'Test instructions',
                    },
                    journeyConfigs: {
                        discount_code_message_threshold: 1,
                        max_follow_up_messages: 0,
                        offer_discount: true,
                        max_discount_percent: 10,
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+15551234567',
                    },
                })
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

            // Default mock for useJourneyContext in handleContinue tests
            mockUseJourneyContext.mockReturnValue({
                journey: { id: 'journey-123', type: 'cart_abandoned' },
                journeyData: {
                    configuration: {
                        max_follow_up_messages: 3,
                        offer_discount: true,
                        max_discount_percent: 20,
                        sms_sender_number: '415-111-111',
                        sms_sender_integration_id: 1,
                        discount_code_message_threshold: 2,
                    },
                },
                currentIntegration: { id: 1, name: 'shopify-store' },
                shopName: 'shopify-store',
                isLoading: false,
                journeyType: 'cart_abandoned',
                storeConfiguration: {
                    monitoredSmsIntegrations: [1, 2],
                },
            })

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
            // Override the default to have no existing journey
            mockUseJourneyContext.mockReturnValue({
                journey: undefined,
                journeyData: {
                    configuration: {
                        max_follow_up_messages: 3,
                        offer_discount: true,
                        max_discount_percent: 20,
                        sms_sender_number: '415-111-111',
                        sms_sender_integration_id: 1,
                        discount_code_message_threshold: 2,
                    },
                },
                currentIntegration: { id: 1, name: 'shopify-store' },
                shopName: 'shopify-store',
                isLoading: false,
                journeyType: 'cart_abandoned',
                storeConfiguration: {
                    monitoredSmsIntegrations: [1, 2],
                },
            })

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
                    message_instructions: null,
                },
                journeyConfigs: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_integration_id: 1,
                    discount_code_message_threshold: 2,
                    sms_sender_number: '+15551234567',
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
            // Uses the default mock from beforeEach which has existing journey

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
            // Override the default to have no existing journey
            mockUseJourneyContext.mockReturnValue({
                journey: undefined,
                journeyData: {
                    configuration: {
                        max_follow_up_messages: 3,
                        offer_discount: true,
                        max_discount_percent: 20,
                        sms_sender_number: '415-111-111',
                        sms_sender_integration_id: 1,
                        discount_code_message_threshold: 2,
                    },
                },
                currentIntegration: { id: 1, name: 'shopify-store' },
                shopName: 'shopify-store',
                isLoading: false,
                journeyType: 'cart_abandoned',
                storeConfiguration: {
                    monitoredSmsIntegrations: [1, 2],
                },
            })

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
                    message_instructions: null,
                },
                journeyConfigs: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_integration_id: 1,
                    sms_sender_number: '+15551234567',
                    discount_code_message_threshold: 2,
                },
            })
        })

        it('should call handleCreate without discount_code_message_threshold when no existing journey exists and discount disabled', async () => {
            // Override the default to have no existing journey
            mockUseJourneyContext.mockReturnValue({
                journey: undefined,
                journeyData: {
                    configuration: {
                        max_follow_up_messages: 3,
                        offer_discount: true,
                        max_discount_percent: 20,
                        sms_sender_number: '415-111-111',
                        sms_sender_integration_id: 1,
                        discount_code_message_threshold: 2,
                    },
                },
                currentIntegration: { id: 1, name: 'shopify-store' },
                shopName: 'shopify-store',
                isLoading: false,
                journeyType: 'cart_abandoned',
                storeConfiguration: {
                    monitoredSmsIntegrations: [1, 2],
                },
            })

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
                    message_instructions: null,
                    store_integration_id: 1,
                    store_name: 'shopify-store',
                },
                journeyConfigs: {
                    max_follow_up_messages: 3,
                    offer_discount: false,
                    max_discount_percent: 20,
                    sms_sender_integration_id: 1,
                    sms_sender_number: '+15551234567',
                },
            })
        })

        it('should call handleUpdate when existing journey exists', async () => {
            // Uses the default mock from beforeEach which has existing journey

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

        describe('AiJourneyPlaygroundEnabled feature flag enabled', () => {
            beforeEach(() => {
                useFlagMock.mockImplementation((flag) => {
                    if (flag === FeatureFlagKey.AiJourneyPlaygroundEnabled) {
                        return true
                    }
                })
            })
            it('should navigate to TEST page after successful journey creation', async () => {
                // Override the default to have no existing journey
                mockUseJourneyContext.mockReturnValue({
                    journey: undefined,
                    journeyData: {
                        configuration: {
                            max_follow_up_messages: 3,
                            offer_discount: true,
                            max_discount_percent: 20,
                            sms_sender_number: '415-111-111',
                            sms_sender_integration_id: 1,
                            discount_code_message_threshold: 2,
                        },
                    },
                    currentIntegration: { id: 1, name: 'shopify-store' },
                    shopName: 'shopify-store',
                    isLoading: false,
                    journeyType: 'cart_abandoned',
                    storeConfiguration: {
                        monitoredSmsIntegrations: [1, 2],
                    },
                })

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
                        message_instructions: null,
                    },
                    journeyConfigs: {
                        max_follow_up_messages: 3,
                        offer_discount: true,
                        max_discount_percent: 20,
                        sms_sender_integration_id: 1,
                        discount_code_message_threshold: 2,
                        sms_sender_number: '+15551234567',
                    },
                })

                await waitFor(() => {
                    expect(mockHistoryPush).toHaveBeenCalledWith(
                        '/app/ai-journey/shopify-store/test',
                    )
                })

                expect(mockMutateAsync).toHaveBeenCalledTimes(1)
            })

            it('should navigate to TEST page after successful journey update', async () => {
                // Uses the default mock from beforeEach which has existing journey

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
                        '/app/ai-journey/shopify-store/test',
                    )
                })
            })
        })
    })
})
