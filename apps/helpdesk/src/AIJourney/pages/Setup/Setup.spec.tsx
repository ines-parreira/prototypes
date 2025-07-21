import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { IntegrationsProvider } from 'AIJourney/providers'
import { mockPhoneNumbers } from 'AIJourney/utils/test-fixtures/mockPhoneNumbers'
import { appQueryClient } from 'api/queryClient'
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

        mockUseUpdateJourney.mockImplementation(() => ({
            mutateAsync: mockUpdateMutateAsync,
            isError: false,
            isLoading: false,
        }))
    })
    const mockStore = configureMockStore([thunk])()

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

        const selectedFollowUpButton = screen.getByRole('button', {
            name: '3',
        })
        expect(selectedFollowUpButton).toHaveClass('selectorOption--selected')

        const discountInput = screen.getByDisplayValue('20')
        expect(discountInput).toBeInTheDocument()
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
                    sms_sender_integration_id: 'sms-1',
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

            mockUseIntegrations.mockImplementation(() => ({
                integrations: [{ id: 1, name: 'shopify-store' }],
                isLoading: false,
            }))

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
                    sms_sender_integration_id: 'sms-1',
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
