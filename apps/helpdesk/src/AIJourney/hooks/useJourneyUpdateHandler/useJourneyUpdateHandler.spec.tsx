import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { JourneyStatusEnum } from '@gorgias/convert-client'

import { useUpdateJourney } from 'AIJourney/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import { IntegrationType } from 'models/integration/constants'
import type { NewPhoneNumber } from 'models/phoneNumber/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useJourneyUpdateHandler } from './useUpdateJourneyHandler'

jest.mock('AIJourney/queries')
jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')

const mockUseUpdateJourney = useUpdateJourney as jest.MockedFunction<
    typeof useUpdateJourney
>
const mockUseAppDispatch = useAppDispatch as jest.MockedFunction<
    typeof useAppDispatch
>
const mockNotify = notify as jest.MockedFunction<typeof notify>

describe('useJourneyUpdateHandler', () => {
    let queryClient: QueryClient
    let mockDispatch: jest.Mock
    let mockMutateAsync: jest.Mock
    let mockUpdateJourney: {
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
        mockUpdateJourney = {
            mutateAsync: mockMutateAsync,
            isLoading: false,
            isSuccess: false,
        }

        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseUpdateJourney.mockReturnValue(mockUpdateJourney as any)
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

    describe('handleUpdate', () => {
        it('should successfully update journey with all parameters', async () => {
            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: 'journey-123',
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    discountCodeThresholdValue: 2,
                    discountValue: '10',
                    followUpValue: 3,
                    includeImage: true,
                    isDiscountEnabled: true,
                    journeyMessageInstructions: 'Custom instructions',
                    journeyState: JourneyStatusEnum.Active,
                    phoneNumberValue: mockPhoneNumber,
                    uploadedImageAttachment: {
                        url: 'image_url',
                        name: 'image_name',
                        content_type: 'content_type',
                    },
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                journeyId: 'journey-123',
                params: {
                    state: JourneyStatusEnum.Active,
                    message_instructions: 'Custom instructions',
                    included_audience_list_ids: undefined,
                    excluded_audience_list_ids: undefined,
                    campaign: undefined,
                },
                journeyConfigs: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 10,
                    sms_sender_integration_id: 123,
                    sms_sender_number: '+1234567890',
                    discount_code_message_threshold: 2,
                    include_image: true,
                    media_urls: [
                        {
                            url: 'image_url',
                            name: 'image_name',
                            content_type: 'content_type',
                        },
                    ],
                },
            })

            expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ['journeys'],
            })
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should handle journey update without config parameters', async () => {
            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: 'journey-123',
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    journeyState: JourneyStatusEnum.Paused,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                journeyId: 'journey-123',
                params: {
                    state: JourneyStatusEnum.Paused,
                    message_instructions: undefined,
                    included_audience_list_ids: undefined,
                    excluded_audience_list_ids: undefined,
                    campaign: undefined,
                },
                journeyConfigs: expect.objectContaining({
                    media_urls: [],
                }),
            })
        })

        it('should handle null message instructions', async () => {
            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: 'journey-123',
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    journeyMessageInstructions: null,
                    journeyState: JourneyStatusEnum.Active,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        message_instructions: null,
                    }),
                }),
            )
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

            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: 'journey-123',
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    followUpValue: 3,
                    isDiscountEnabled: true,
                    journeyState: JourneyStatusEnum.Active,
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
            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: 'journey-123',
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    discountValue: '25',
                    isDiscountEnabled: true,
                    journeyState: JourneyStatusEnum.Active,
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

        it('should set max_discount_percent to undefined when discount value is empty string', async () => {
            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: 'journey-123',
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    discountValue: '',
                    journeyState: JourneyStatusEnum.Active,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                journeyId: 'journey-123',
                params: {
                    state: JourneyStatusEnum.Active,
                    message_instructions: undefined,
                    included_audience_list_ids: undefined,
                    excluded_audience_list_ids: undefined,
                    campaign: undefined,
                },
                journeyConfigs: expect.objectContaining({
                    max_discount_percent: undefined,
                    media_urls: [],
                }),
            })
        })

        it('should set max_discount_percent to undefined when discount value is not provided', async () => {
            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: 'journey-123',
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    isDiscountEnabled: true,
                    journeyState: JourneyStatusEnum.Active,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        offer_discount: true,
                        max_discount_percent: undefined,
                    }),
                }),
            )
        })

        it('should use id parameter over journeyId from hook', async () => {
            const mockResponse = { id: 'override-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: 'journey-123',
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    id: 'override-123',
                    journeyState: JourneyStatusEnum.Active,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyId: 'override-123',
                }),
            )
        })
    })

    describe('error handling', () => {
        it('should throw error when integrationId is missing and phoneNumberValue is provided', async () => {
            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: undefined,
                        journeyId: 'journey-123',
                    }),
                { wrapper },
            )

            await act(async () => {
                await expect(
                    result.current.handleUpdate({
                        journeyState: JourneyStatusEnum.Active,
                        phoneNumberValue: mockPhoneNumber,
                    }),
                ).rejects.toThrow('Missing integration')
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: expect.stringContaining('Error updating journey:'),
                    status: NotificationStatus.Error,
                }),
            )
        })

        it('should throw error when journey id is missing', async () => {
            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: undefined,
                    }),
                { wrapper },
            )

            await act(async () => {
                await expect(
                    result.current.handleUpdate({
                        journeyState: JourneyStatusEnum.Active,
                    }),
                ).rejects.toThrow('Missing journey')
            })
        })

        it('should throw error when journey id is empty string', async () => {
            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: '',
                    }),
                { wrapper },
            )

            await act(async () => {
                await expect(
                    result.current.handleUpdate({
                        journeyState: JourneyStatusEnum.Active,
                    }),
                ).rejects.toThrow('Missing journey')
            })
        })

        it('should handle API errors and dispatch notification', async () => {
            const apiError = new Error('API request failed')
            mockMutateAsync.mockRejectedValue(apiError)

            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: 'journey-123',
                    }),
                { wrapper },
            )

            await act(async () => {
                await expect(
                    result.current.handleUpdate({
                        journeyState: JourneyStatusEnum.Active,
                    }),
                ).rejects.toThrow('API request failed')
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message:
                        'Error updating journey: Error: API request failed',
                    status: NotificationStatus.Error,
                }),
            )
        })
    })

    describe('loading and success states', () => {
        it('should return loading state from useUpdateJourney', () => {
            mockUpdateJourney.isLoading = true

            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: 'journey-123',
                    }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
            expect(result.current.isSuccess).toBe(false)
        })

        it('should return success state from useUpdateJourney', () => {
            mockUpdateJourney.isSuccess = true

            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: 'journey-123',
                    }),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(false)
            expect(result.current.isSuccess).toBe(true)
        })
    })

    describe('journey with media', () => {
        it('should update journey with empty media_urls when no image attachment is provided', async () => {
            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () =>
                    useJourneyUpdateHandler({
                        integrationId: 100,
                        journeyId: 'journey-123',
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    followUpValue: 3,
                    isDiscountEnabled: true,
                    journeyState: JourneyStatusEnum.Active,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        media_urls: [],
                    }),
                }),
            )
        })
    })
})
