import React from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'

import { useAiJourneyPhoneList, useJourneyUpdateHandler } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'
import { useCreateNewJourney } from 'AIJourney/queries'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import { IntegrationType } from 'models/integration/constants'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { Setup } from './Setup'

// Mock dependencies
jest.mock('AIJourney/hooks')
jest.mock('AIJourney/providers')
jest.mock('AIJourney/queries')
jest.mock('core/flags')
jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')

// Mock components to avoid complex rendering
jest.mock('./fields', () => ({
    PhoneNumberField: ({ onChange, value }: any) => (
        <div data-testid="phone-number-field">
            <button
                onClick={() => onChange(mockPhoneNumbers[0])}
                data-testid="phone-number-select"
            >
                Select Phone: {value?.phone_number || 'None'}
            </button>
        </div>
    ),
    MessagesToSendField: ({ onChange, value }: any) => (
        <div data-testid="messages-field">
            <button onClick={() => onChange(5)} data-testid="messages-input">
                Messages: {value}
            </button>
        </div>
    ),
    EnableDiscountField: ({ onChange, isEnabled }: any) => (
        <div data-testid="discount-field">
            <button onClick={onChange} data-testid="discount-toggle">
                Discount: {isEnabled ? 'On' : 'Off'}
            </button>
        </div>
    ),
    MaximumDiscountField: ({ onChange, value, onValidationChange }: any) => (
        <div data-testid="max-discount-field">
            <input
                data-testid="discount-input"
                value={value}
                onChange={(e) => {
                    onChange(e.target.value)
                    onValidationChange(
                        !!e.target.value && Number(e.target.value) > 0,
                    )
                }}
            />
        </div>
    ),
    MessageWithDiscountCodeField: ({ onChange, value }: any) => (
        <div data-testid="discount-code-field">
            <button
                onClick={() => onChange(2)}
                data-testid="discount-code-input"
            >
                Code Threshold: {value}
            </button>
        </div>
    ),
    EnableImageField: ({ onChange, isEnabled }: any) => (
        <div data-testid="image-field">
            <button onClick={onChange} data-testid="image-toggle">
                Image: {isEnabled ? 'On' : 'Off'}
            </button>
        </div>
    ),
}))

jest.mock('AIJourney/components', () => ({
    Button: ({ label, onClick, isDisabled, redirectLink, variant }: any) => (
        <button
            data-testid={
                variant === 'link' ? 'cancel-button' : 'continue-button'
            }
            onClick={onClick}
            disabled={isDisabled}
            data-redirect={redirectLink}
        >
            {label}
        </button>
    ),
}))

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>
const mockUseJourneyContext = useJourneyContext as jest.MockedFunction<
    typeof useJourneyContext
>
const mockUseAiJourneyPhoneList = useAiJourneyPhoneList as jest.MockedFunction<
    typeof useAiJourneyPhoneList
>
const mockUseCreateNewJourney = useCreateNewJourney as jest.MockedFunction<
    typeof useCreateNewJourney
>
const mockUseJourneyUpdateHandler =
    useJourneyUpdateHandler as jest.MockedFunction<
        typeof useJourneyUpdateHandler
    >
const mockUseAppDispatch = useAppDispatch as jest.MockedFunction<
    typeof useAppDispatch
>
const mockNotify = notify as jest.MockedFunction<typeof notify>

const mockPhoneNumbers: NewPhoneNumber[] = [
    {
        phone_number: '+1234567890',
        integrations: [
            { id: 123, type: IntegrationType.Sms, name: 'SMS Integration' },
            {
                id: 456,
                type: IntegrationType.Aircall,
                name: 'Aircall Integration',
            },
        ],
    } as NewPhoneNumber,
    {
        phone_number: '+0987654321',
        integrations: [
            { id: 789, type: IntegrationType.Sms, name: 'SMS Integration 2' },
        ],
    } as NewPhoneNumber,
]

const mockJourneyContext = {
    currentJourney: {
        id: 'journey-123',
        state: 'active',
    },
    journeyData: {
        configuration: {
            max_follow_up_messages: 2,
            offer_discount: true,
            max_discount_percent: 15,
            sms_sender_integration_id: 123,
            discount_code_message_threshold: 1,
            include_image: false,
        },
    },
    journeyType: 'cart-abandoned',
    currentIntegration: {
        id: 100,
        name: 'Test Store',
    },
    shopName: 'test-shop',
    isLoading: false,
    storeConfiguration: {
        monitoredSmsIntegrations: [123, 789],
    },
}

describe('Setup', () => {
    let queryClient: QueryClient
    let history: ReturnType<typeof createMemoryHistory>
    let mockDispatch: jest.Mock
    let mockCreateJourneyMutate: jest.Mock
    let mockHandleUpdate: jest.Mock
    let store: any

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        })
        history = createMemoryHistory()
        mockDispatch = jest.fn()
        mockCreateJourneyMutate = jest.fn()
        mockHandleUpdate = jest.fn()

        // Mock store for Provider
        store = {
            getState: jest.fn(() => ({})),
            subscribe: jest.fn(),
            dispatch: jest.fn(),
        }

        // Set up default mocks
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseJourneyContext.mockReturnValue(mockJourneyContext as any)
        mockUseAiJourneyPhoneList.mockReturnValue({
            marketingCapabilityPhoneNumbers: mockPhoneNumbers,
        })
        mockUseCreateNewJourney.mockReturnValue({
            mutateAsync: mockCreateJourneyMutate,
            data: undefined,
            error: null,
            isError: false,
            isIdle: true,
            isLoading: false,
            isPaused: false,
            isSuccess: false,
            status: 'idle',
            failureCount: 0,
            failureReason: null,
            reset: jest.fn(),
            mutate: jest.fn(),
            context: undefined,
            variables: undefined,
        } as any)
        mockUseJourneyUpdateHandler.mockReturnValue({
            handleUpdate: mockHandleUpdate,
            isLoading: false,
            isSuccess: false,
        })
        mockNotify.mockReturnValue(() => Promise.resolve())

        // Default feature flags
        mockUseFlag.mockImplementation((flag: string) => {
            switch (flag) {
                case FeatureFlagKey.AiJourneySmsImagesEnabled:
                    return true
                default:
                    return false
            }
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const renderSetup = () => {
        return render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <Router history={history}>
                        <Setup />
                    </Router>
                </QueryClientProvider>
            </Provider>,
        )
    }

    describe('component rendering', () => {
        it('should render all form fields when feature flags are enabled', () => {
            renderSetup()

            expect(screen.getByTestId('phone-number-field')).toBeInTheDocument()
            expect(screen.getByTestId('messages-field')).toBeInTheDocument()
            expect(screen.getByTestId('image-field')).toBeInTheDocument()
            expect(screen.getByTestId('discount-field')).toBeInTheDocument()
            expect(screen.getByTestId('continue-button')).toBeInTheDocument()
            expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
        })

        it('should not render image field when feature flag is disabled', () => {
            mockUseFlag.mockImplementation((flag: string) => {
                switch (flag) {
                    case FeatureFlagKey.AiJourneySmsImagesEnabled:
                        return false
                }
            })

            renderSetup()

            expect(screen.queryByTestId('image-field')).not.toBeInTheDocument()
        })

        it('should render loading spinner when journey data is loading', () => {
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContext,
                isLoading: true,
            } as any)

            renderSetup()

            expect(screen.getByRole('status')).toBeInTheDocument()
        })
    })

    describe('form interaction', () => {
        it('should enable discount field and show max discount input', async () => {
            renderSetup()

            const discountToggle = screen.getByTestId('discount-toggle')
            expect(discountToggle).toHaveTextContent('Discount: On')

            // Should show max discount field since discount is enabled
            expect(screen.getByTestId('max-discount-field')).toBeInTheDocument()
        })

        it('should show discount code field when discount is enabled and messages > 1', () => {
            renderSetup()

            expect(
                screen.getByTestId('discount-code-field'),
            ).toBeInTheDocument()
        })

        it('should update phone number when selected', async () => {
            renderSetup()

            const phoneSelect = screen.getByTestId('phone-number-select')
            fireEvent.click(phoneSelect)

            expect(phoneSelect).toHaveTextContent('Select Phone: +1234567890')
        })

        it('should update message count and reset discount threshold', async () => {
            renderSetup()

            const messagesButton = screen.getByTestId('messages-input')
            fireEvent.click(messagesButton)

            expect(messagesButton).toHaveTextContent('Messages: 5')
        })

        it('should toggle discount field', async () => {
            // Start with discount disabled
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContext,
                journeyData: {
                    configuration: {
                        ...mockJourneyContext.journeyData!.configuration,
                        offer_discount: false,
                    },
                },
            } as any)

            renderSetup()

            const discountToggle = screen.getByTestId('discount-toggle')
            expect(discountToggle).toHaveTextContent('Discount: Off')

            fireEvent.click(discountToggle)
            expect(discountToggle).toHaveTextContent('Discount: On')
        })

        it('should toggle image field', async () => {
            // Start with image disabled
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContext,
                journeyData: {
                    configuration: {
                        ...mockJourneyContext.journeyData!.configuration,
                        include_image: false,
                    },
                },
            } as any)

            renderSetup()

            const imageToggle = screen.getByTestId('image-toggle')
            expect(imageToggle).toHaveTextContent('Image: Off')

            fireEvent.click(imageToggle)
            expect(imageToggle).toHaveTextContent('Image: On')
        })
    })

    describe('form validation', () => {
        it('should disable continue button when phone number is missing', () => {
            // Mock context without phone number
            mockUseAiJourneyPhoneList.mockReturnValue({
                marketingCapabilityPhoneNumbers: [],
            })

            renderSetup()

            const continueButton = screen.getByTestId('continue-button')
            expect(continueButton).toBeDisabled()
        })

        it('should disable continue button when discount is enabled but invalid', () => {
            renderSetup()

            const discountInput = screen.getByTestId('discount-input')
            fireEvent.change(discountInput, { target: { value: '' } })

            const continueButton = screen.getByTestId('continue-button')
            expect(continueButton).toBeDisabled()
        })

        it('should enable continue button when all fields are valid', () => {
            renderSetup()

            const continueButton = screen.getByTestId('continue-button')
            expect(continueButton).not.toBeDisabled()
        })
    })

    describe('journey update flow', () => {
        it('should call handleUpdate when journey exists', async () => {
            mockHandleUpdate.mockResolvedValue({})

            renderSetup()

            const continueButton = screen.getByTestId('continue-button')
            fireEvent.click(continueButton)

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalledWith({
                    journeyState: 'active',
                })
            })

            await waitFor(() => {
                expect(history.location.pathname).toBe(
                    '/app/ai-journey/test-shop/cart-abandoned/test',
                )
            })
        })

        it('should handle update error gracefully', async () => {
            const error = new Error('Update failed')
            mockHandleUpdate.mockRejectedValue(error)

            renderSetup()

            const continueButton = screen.getByTestId('continue-button')
            fireEvent.click(continueButton)

            await waitFor(() => {
                expect(mockHandleUpdate).toHaveBeenCalled()
            })

            // Should not navigate on error
            expect(history.location.pathname).toBe('/')
        })
    })

    describe('journey creation flow', () => {
        beforeEach(() => {
            // Mock context without existing journey
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContext,
                currentJourney: null,
            } as any)
        })

        it('should call createNewJourney when no journey exists', async () => {
            mockCreateJourneyMutate.mockResolvedValue({})

            renderSetup()

            const continueButton = screen.getByTestId('continue-button')
            fireEvent.click(continueButton)

            await waitFor(() => {
                expect(mockCreateJourneyMutate).toHaveBeenCalledWith({
                    params: {
                        store_integration_id: 100,
                        store_name: 'Test Store',
                        type: 'cart_abandoned',
                    },
                    journeyConfigs: {
                        max_follow_up_messages: 2,
                        offer_discount: true,
                        max_discount_percent: 15,
                        sms_sender_integration_id: 123,
                        sms_sender_number: '+1234567890',
                        discount_code_message_threshold: 1,
                    },
                })
            })
        })

        it('should handle creation error and dispatch notification', async () => {
            const error = new Error('Creation failed')
            mockCreateJourneyMutate.mockRejectedValue(error)

            renderSetup()

            const continueButton = screen.getByTestId('continue-button')
            fireEvent.click(continueButton)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    notify({
                        message:
                            'Error creating new journey: Error: Creation failed',
                        status: NotificationStatus.Error,
                    }),
                )
            })
        })

        it('should throw error when integration info is missing for creation', async () => {
            // Mock context without integration
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContext,
                currentJourney: null,
                currentIntegration: null,
            } as any)

            renderSetup()

            const continueButton = screen.getByTestId('continue-button')
            fireEvent.click(continueButton)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    notify({
                        message: expect.stringContaining(
                            'Missing integration information',
                        ),
                        status: NotificationStatus.Error,
                    }),
                )
            })
        })

        it('should throw error when integration has no name for creation', async () => {
            // Mock context with integration without name
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContext,
                currentJourney: null,
                currentIntegration: {
                    id: 100,
                    name: undefined,
                },
            } as any)

            renderSetup()

            const continueButton = screen.getByTestId('continue-button')
            fireEvent.click(continueButton)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    notify({
                        message: expect.stringContaining(
                            'Missing integration information',
                        ),
                        status: NotificationStatus.Error,
                    }),
                )
            })
        })

        it('should throw error when integration has no id for creation', async () => {
            // Mock context with integration without id
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContext,
                currentJourney: null,
                currentIntegration: {
                    id: undefined,
                    name: 'Test Store',
                },
            } as any)

            renderSetup()

            const continueButton = screen.getByTestId('continue-button')
            fireEvent.click(continueButton)

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith(
                    notify({
                        message: expect.stringContaining(
                            'Missing integration information',
                        ),
                        status: NotificationStatus.Error,
                    }),
                )
            })
        })
    })

    describe('effects and state management', () => {
        it('should initialize state from journey configuration', () => {
            renderSetup()

            // Values should be initialized from mockJourneyContext.journeyData.configuration
            expect(screen.getByTestId('messages-input')).toHaveTextContent(
                'Messages: 3',
            ) // max_follow_up_messages + 1
            expect(screen.getByTestId('discount-toggle')).toHaveTextContent(
                'Discount: On',
            )
        })

        it('should update state when journey parameters change', () => {
            const { rerender } = renderSetup()

            // Change journey configuration
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContext,
                journeyData: {
                    configuration: {
                        ...mockJourneyContext.journeyData!.configuration,
                        max_follow_up_messages: 4,
                        offer_discount: false,
                    },
                },
            } as any)

            rerender(
                <Provider store={store}>
                    <QueryClientProvider client={queryClient}>
                        <Router history={history}>
                            <Setup />
                        </Router>
                    </QueryClientProvider>
                </Provider>,
            )

            expect(screen.getByTestId('messages-input')).toHaveTextContent(
                'Messages: 5',
            )
            expect(screen.getByTestId('discount-toggle')).toHaveTextContent(
                'Discount: Off',
            )
        })
    })

    describe('loading states', () => {
        it('should disable continue button when journey update is loading', () => {
            mockUseJourneyUpdateHandler.mockReturnValue({
                handleUpdate: mockHandleUpdate,
                isLoading: true,
                isSuccess: false,
            })

            renderSetup()

            const continueButton = screen.getByTestId('continue-button')
            expect(continueButton).toBeDisabled()
        })

        it('should disable continue button when journey update is successful', () => {
            mockUseJourneyUpdateHandler.mockReturnValue({
                handleUpdate: mockHandleUpdate,
                isLoading: false,
                isSuccess: true,
            })

            renderSetup()

            const continueButton = screen.getByTestId('continue-button')
            expect(continueButton).toBeDisabled()
        })
    })

    describe('edge cases', () => {
        it('should handle missing phone number integration gracefully', () => {
            mockUseAiJourneyPhoneList.mockReturnValue({
                marketingCapabilityPhoneNumbers: [],
            })

            renderSetup()

            expect(screen.getByTestId('phone-number-select')).toHaveTextContent(
                'Select Phone: None',
            )
        })

        it('should set discount threshold for discount enabled without existing threshold', () => {
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContext,
                journeyData: {
                    configuration: {
                        ...mockJourneyContext.journeyData!.configuration,
                        discount_code_message_threshold: undefined,
                    },
                },
            } as any)

            renderSetup()

            // Default threshold should be 1
            expect(screen.getByTestId('discount-code-input')).toHaveTextContent(
                'Code Threshold: 1',
            )
        })

        it('should handle creation with disabled discount', async () => {
            mockUseJourneyContext.mockReturnValue({
                ...mockJourneyContext,
                currentJourney: null,
                journeyData: {
                    configuration: {
                        ...mockJourneyContext.journeyData!.configuration,
                        offer_discount: false,
                    },
                },
            } as any)

            mockCreateJourneyMutate.mockResolvedValue({})

            renderSetup()

            const continueButton = screen.getByTestId('continue-button')
            fireEvent.click(continueButton)

            await waitFor(() => {
                expect(mockCreateJourneyMutate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        journeyConfigs: expect.objectContaining({
                            discount_code_message_threshold: undefined,
                        }),
                    }),
                )
            })
        })
    })
})
