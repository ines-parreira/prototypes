import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { JOURNEY_TYPES } from 'AIJourney/constants'
import { useCreateNewJourney } from 'AIJourney/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import { IntegrationType } from 'models/integration/constants'
import type { NewPhoneNumber } from 'models/phoneNumber/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useJourneyCreateHandler } from './useJourneyCreateHandler'

jest.mock('AIJourney/queries')
jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')

const mockUseCreateNewJourney = useCreateNewJourney as jest.MockedFunction<
    typeof useCreateNewJourney
>
const mockUseAppDispatch = useAppDispatch as jest.MockedFunction<
    typeof useAppDispatch
>
const mockNotify = notify as jest.MockedFunction<typeof notify>

describe('useJourneyCreateHandler', () => {
    let queryClient: QueryClient
    let mockDispatch: jest.Mock
    let mockMutateAsync: jest.Mock
    let mockCreateNewJourney: {
        mutateAsync: jest.Mock
        isLoading: boolean
        isSuccess: boolean
    }

    const mockPhoneNumber: NewPhoneNumber = {
        phone_number: '+1234567890',
        integrations: [
            { id: 123, type: IntegrationType.Sms, name: 'SMS Integration' },
            {
                id: 456,
                type: IntegrationType.Aircall,
                name: 'Aircall Integration',
            },
        ],
    } as NewPhoneNumber

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        })
        mockDispatch = jest.fn()
        mockMutateAsync = jest.fn()
        mockCreateNewJourney = {
            mutateAsync: mockMutateAsync,
            isLoading: false,
            isSuccess: false,
        }

        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseCreateNewJourney.mockReturnValue(mockCreateNewJourney as any)
        mockNotify.mockReturnValue(() => Promise.resolve())

        jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(
            undefined,
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    describe('handleCreate', () => {
        it('should successfully create journey with all parameters', async () => {
            const mockResponse = { id: 'journey-123', created: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    campaignTitle: 'Test Campaign',
                    discountCodeThresholdValue: 2,
                    discountValue: '10',
                    excludedAudienceListIds: ['list-2'],
                    followUpValue: 3,
                    includeImage: true,
                    includedAudienceListIds: ['list-1'],
                    isDiscountEnabled: true,
                    phoneNumberValue: mockPhoneNumber,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                params: {
                    store_integration_id: 100,
                    store_name: 'Test Store',
                    type: 'cart_abandoned',
                    campaign: {
                        title: 'Test Campaign',
                    },
                    included_audience_list_ids: ['list-1'],
                    excluded_audience_list_ids: ['list-2'],
                },
                journeyConfigs: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 10,
                    sms_sender_integration_id: 123,
                    sms_sender_number: '+1234567890',
                    discount_code_message_threshold: 2,
                    include_image: true,
                },
            })

            expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ['journeys'],
            })
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should create journey without optional parameters', async () => {
            const mockResponse = { id: 'journey-123', created: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.WIN_BACK,
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    followUpValue: 2,
                    isDiscountEnabled: false,
                    phoneNumberValue: mockPhoneNumber,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                params: {
                    store_integration_id: 100,
                    store_name: 'Test Store',
                    type: 'win_back',
                    campaign: undefined,
                    included_audience_list_ids: undefined,
                    excluded_audience_list_ids: undefined,
                },
                journeyConfigs: {
                    max_follow_up_messages: 2,
                    offer_discount: false,
                    max_discount_percent: undefined,
                    sms_sender_integration_id: 123,
                    sms_sender_number: '+1234567890',
                    discount_code_message_threshold: undefined,
                    include_image: undefined,
                },
            })
        })

        it('should create campaign journey with campaign title and audience lists', async () => {
            const mockResponse = { id: 'campaign-123', created: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.CAMPAIGN,
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    campaignTitle: 'Summer Sale',
                    excludedAudienceListIds: ['exclude-1'],
                    includedAudienceListIds: ['include-1', 'include-2'],
                    phoneNumberValue: mockPhoneNumber,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                params: {
                    store_integration_id: 100,
                    store_name: 'Test Store',
                    type: 'campaign',
                    campaign: {
                        title: 'Summer Sale',
                    },
                    included_audience_list_ids: ['include-1', 'include-2'],
                    excluded_audience_list_ids: ['exclude-1'],
                },
                journeyConfigs: expect.any(Object),
            })
        })

        it('should handle phone number without SMS integration', async () => {
            const phoneNumberWithoutSms: NewPhoneNumber = {
                phone_number: '+1234567890',
                integrations: [
                    {
                        id: 456,
                        type: IntegrationType.Aircall,
                        name: 'Aircall Integration',
                    },
                ],
            } as NewPhoneNumber

            const mockResponse = { id: 'journey-123', created: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    isDiscountEnabled: true,
                    phoneNumberValue: phoneNumberWithoutSms,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        sms_sender_integration_id: undefined,
                        sms_sender_number: '+1234567890',
                    }),
                }),
            )
        })

        it('should handle discount value as string and convert to number', async () => {
            const mockResponse = { id: 'journey-123', created: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    discountValue: '25',
                    isDiscountEnabled: true,
                    phoneNumberValue: mockPhoneNumber,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        max_discount_percent: 25,
                    }),
                }),
            )
        })

        it('should handle empty discount value', async () => {
            const mockResponse = { id: 'journey-123', created: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    discountValue: '',
                    isDiscountEnabled: true,
                    phoneNumberValue: mockPhoneNumber,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        max_discount_percent: undefined,
                    }),
                }),
            )
        })

        it('should only include discount_code_message_threshold when discount is enabled', async () => {
            const mockResponse = { id: 'journey-123', created: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    discountCodeThresholdValue: 3,
                    discountValue: '15',
                    isDiscountEnabled: false,
                    phoneNumberValue: mockPhoneNumber,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        discount_code_message_threshold: undefined,
                    }),
                }),
            )
        })

        it('should not include campaign when campaign title is undefined', async () => {
            const mockResponse = { id: 'journey-123', created: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    phoneNumberValue: mockPhoneNumber,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        campaign: undefined,
                    }),
                }),
            )
        })
    })

    describe('error handling', () => {
        it('should throw error when integrationId is missing', async () => {
            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: undefined,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                    }),
                { wrapper },
            )

            await act(async () => {
                await expect(
                    result.current.handleCreate({
                        phoneNumberValue: mockPhoneNumber,
                    }),
                ).rejects.toThrow('Missing integration information')
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: expect.stringContaining(
                        'Error creating new journey:',
                    ),
                    status: NotificationStatus.Error,
                }),
            )
        })

        it('should throw error when integrationName is missing', async () => {
            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: undefined,
                        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                    }),
                { wrapper },
            )

            await act(async () => {
                await expect(
                    result.current.handleCreate({
                        phoneNumberValue: mockPhoneNumber,
                    }),
                ).rejects.toThrow('Missing integration information')
            })
        })

        it('should handle API errors and dispatch notification', async () => {
            const apiError = new Error('API request failed')
            mockMutateAsync.mockRejectedValue(apiError)

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                    }),
                { wrapper },
            )

            await act(async () => {
                await expect(
                    result.current.handleCreate({
                        phoneNumberValue: mockPhoneNumber,
                    }),
                ).rejects.toThrow('API request failed')
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message:
                        'Error creating new journey: Error: API request failed',
                    status: NotificationStatus.Error,
                }),
            )
        })
    })

    describe('loading and success states', () => {
        it('should return loading state from useCreateNewJourney', () => {
            mockCreateNewJourney.isLoading = true

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                    }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
            expect(result.current.isSuccess).toBe(false)
        })

        it('should return success state from useCreateNewJourney', () => {
            mockCreateNewJourney.isSuccess = true

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                    }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(false)
            expect(result.current.isSuccess).toBe(true)
        })
    })

    describe('journey types', () => {
        it('should map CART_ABANDONMENT type correctly', async () => {
            const mockResponse = { id: 'journey-123', created: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    phoneNumberValue: mockPhoneNumber,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        type: 'cart_abandoned',
                    }),
                }),
            )
        })

        it('should map SESSION_ABANDONMENT type correctly', async () => {
            const mockResponse = { id: 'journey-123', created: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.SESSION_ABANDONMENT,
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    phoneNumberValue: mockPhoneNumber,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        type: 'session_abandoned',
                    }),
                }),
            )
        })

        it('should map WIN_BACK type correctly', async () => {
            const mockResponse = { id: 'journey-123', created: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.WIN_BACK,
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    phoneNumberValue: mockPhoneNumber,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        type: 'win_back',
                    }),
                }),
            )
        })

        it('should map CAMPAIGN type correctly', async () => {
            const mockResponse = { id: 'journey-123', created: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        integrationId: 100,
                        integrationName: 'Test Store',
                        journeyType: JOURNEY_TYPES.CAMPAIGN,
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    campaignTitle: 'Test Campaign',
                    phoneNumberValue: mockPhoneNumber,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        type: 'campaign',
                    }),
                }),
            )
        })
    })
})
