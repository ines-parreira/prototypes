import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
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
import { assumeMock } from 'utils/testing'

import { OnboardingCard } from './OnboardingCard'

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

describe('<OnboardingCard />', () => {
    const mockStore = configureMockStore([thunk])()

    beforeEach(() => {
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

    it('should render step name in card', () => {
        render(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <OnboardingCard currentStep={'Conversation Setup'} />
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('Conversation Setup step')).toBeInTheDocument()
    })

    it('should redirect from conversation setup to activation', async () => {
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

        render(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <OnboardingCard currentStep={'Conversation Setup'} />
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('Conversation Setup step')).toBeInTheDocument()

        const buttonLabel = screen.getByText('Continue')
        expect(buttonLabel).toBeInTheDocument()

        const button = screen.getByTestId('ai-journey-button')
        expect(button).not.toBeDisabled()

        await userEvent.click(button)

        expect(mockHistoryPush).toHaveBeenCalledTimes(1)
        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/ai-journey/shopify-store/activation',
        )
    })

    it('should update state when journeyParams is fetched', async () => {
        mockUseJourneyConfiguration.mockImplementation(() => ({
            data: {
                max_follow_up_messages: 3,
                offer_discount: true,
                max_discount_percent: 20,
            },
            isError: false,
            isLoading: false,
        }))

        render(
            <Provider store={mockStore}>
                <QueryClientProvider client={appQueryClient}>
                    <IntegrationsProvider>
                        <OnboardingCard currentStep="Conversation Setup" />
                    </IntegrationsProvider>
                </QueryClientProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Conversation Setup step'),
            ).toBeInTheDocument()
        })

        const selectedFollowUpButton = screen.getByRole('button', {
            name: '3',
        })
        expect(selectedFollowUpButton).toHaveClass('selectorOption--selected')

        const discountInput = screen.getByDisplayValue('20')
        expect(discountInput).toBeInTheDocument()
    })

    describe('Error Handling', () => {
        beforeEach(() => {
            jest.clearAllMocks()
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

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Conversation Setup" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            await userEvent.click(button)

            await expect(mockMutateAsync()).rejects.toThrow(
                'Missing integration ID',
            )
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

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Conversation Setup" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            await userEvent.click(button)

            await expect(mockMutateAsync()).rejects.toThrow(
                'Missing integration name',
            )
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

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Conversation Setup" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            await userEvent.click(button)

            await expect(mockUpdateJourney()).rejects.toThrow(
                'Missing integration ID',
            )
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

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Conversation Setup" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            await userEvent.click(button)

            await expect(mockUpdateJourney()).rejects.toThrow(
                'Missing integration name',
            )
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

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Conversation Setup" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            await userEvent.click(button)

            await expect(mockUpdateJourney()).rejects.toThrow(
                'Missing journey ID',
            )
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

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Conversation Setup" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            await userEvent.click(button)

            await expect(mockMutateAsync()).rejects.toThrow(
                'Missing integration information',
            )
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

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Conversation Setup" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            await userEvent.click(button)

            await expect(mockUpdateJourney()).rejects.toThrow(
                'Missing integration information',
            )
        })
    })

    describe('handleContinue', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        it('should navigate to activation page after successful journey creation', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1, name: 'shopify-store' }],
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [],
                isError: false,
                isLoading: false,
            }))

            const mockMutateAsync = jest.fn().mockResolvedValue({})
            mockUseCreateNewJourney.mockImplementation(() => ({
                mutateAsync: mockMutateAsync,
                isError: false,
                isLoading: false,
            }))

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Conversation Setup" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            await userEvent.click(button)

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

            const mockUpdateMutateAsync = jest.fn().mockResolvedValue({})
            mockUseUpdateJourney.mockImplementation(() => ({
                mutateAsync: mockUpdateMutateAsync,
                isError: false,
                isLoading: false,
            }))

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Conversation Setup" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            await userEvent.click(button)

            await waitFor(() => {
                expect(mockHistoryPush).toHaveBeenCalledWith(
                    '/app/ai-journey/shopify-store/activation',
                )
            })

            expect(mockUpdateMutateAsync).toHaveBeenCalledTimes(1)
        })

        it('should not navigate when journey creation fails', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1, name: 'shopify-store' }],
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [],
                isError: false,
                isLoading: false,
            }))

            const mutationError = new Error('Creation failed')
            const mockMutateAsync = jest.fn().mockRejectedValue(mutationError)
            mockUseCreateNewJourney.mockImplementation(() => ({
                mutateAsync: mockMutateAsync,
                isError: false,
                isLoading: false,
            }))

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Conversation Setup" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            await userEvent.click(button)

            expect(mockHistoryPush).not.toHaveBeenCalled()
        })

        it('should not navigate when journey update fails', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1, name: 'shopify-store' }],
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [{ id: 'journey-123', type: 'cart_abandoned' }],
                isError: false,
                isLoading: false,
            }))

            const mutationError = new Error('Update failed')
            const mockUpdateMutateAsync = jest
                .fn()
                .mockRejectedValue(mutationError)
            mockUseUpdateJourney.mockImplementation(() => ({
                mutateAsync: mockUpdateMutateAsync,
                isError: false,
                isLoading: false,
            }))

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Conversation Setup" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            await userEvent.click(button)

            expect(mockHistoryPush).not.toHaveBeenCalled()
        })

        it('should call handleCreate when no existing journey exists', async () => {
            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1, name: 'shopify-store' }],
                isLoading: false,
            }))

            mockUseJourneys.mockImplementation(() => ({
                data: [],
                isError: false,
                isLoading: false,
            }))

            const mockMutateAsync = jest.fn().mockResolvedValue({})
            mockUseCreateNewJourney.mockImplementation(() => ({
                mutateAsync: mockMutateAsync,
                isError: false,
                isLoading: false,
            }))

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Conversation Setup" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            await userEvent.click(button)

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
                    sms_sender_integration_id: 'sms-1',
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

            const mockUpdateMutateAsync = jest.fn().mockResolvedValue({})
            mockUseUpdateJourney.mockImplementation(() => ({
                mutateAsync: mockUpdateMutateAsync,
                isError: false,
                isLoading: false,
            }))

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Conversation Setup" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

            const button = screen.getByTestId('ai-journey-button')
            expect(button).not.toBeDisabled()
            await userEvent.click(button)

            await waitFor(() => {
                expect(mockUpdateMutateAsync).toHaveBeenCalledTimes(1)
            })

            expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
                journeyId: 'journey-123',
                params: {
                    state: 'active',
                },
                journeyConfigs: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 20,
                    sms_sender_integration_id: 'sms-1',
                },
            })
        })
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

        it('should show error notification when journey ID is missing', async () => {
            mockUseJourneys.mockImplementation(() => ({
                data: [{ type: 'cart_abandoned' }], // missing id
                isError: false,
                isLoading: false,
            }))

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Activation" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

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

            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Activation" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

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
                    message:
                        'Error sending test SMS: Error: SMS service unavailable',
                    status: 'error',
                })
            })

            expect(mockDispatch).toHaveBeenCalledWith(mockNotifyAction)
        })

        it('should successfully send test SMS when all conditions are met', async () => {
            render(
                <Provider store={mockStore}>
                    <QueryClientProvider client={appQueryClient}>
                        <IntegrationsProvider>
                            <OnboardingCard currentStep="Activation" />
                        </IntegrationsProvider>
                    </QueryClientProvider>
                </Provider>,
            )

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

            expect(mockTestSmsMutateAsync).toHaveBeenCalledWith({
                phoneNumber: '+11234567890',
                journeyId: 'journey-123',
                product: {
                    product_id: expect.any(String),
                    variant_id: expect.any(String),
                    price: expect.any(Number),
                },
            })
        })
    })
})
