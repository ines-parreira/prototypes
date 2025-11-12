import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

import { JourneyStatusEnum } from '@gorgias/convert-client'

import { useUpdateJourney } from 'AIJourney/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import { IntegrationType } from 'models/integration/constants'
import { NewPhoneNumber } from 'models/phoneNumber/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useJourneyUpdateHandler } from './useUpdateJourneyHandler'

// Mock dependencies
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
        data: undefined
        error: null
        isError: boolean
        isIdle: boolean
        isPaused: boolean
        status: string
        failureCount: number
        failureReason: null
        reset: jest.Mock
        mutate: jest.Mock
        context: undefined
        variables: undefined
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

    const defaultParams = {
        integrationId: 100,
        journeyId: 'journey-123',
        followUpValue: 3,
        isDiscountEnabled: true,
        discountValue: '10',
        phoneNumberValue: mockPhoneNumber,
        discountCodeThresholdValue: 2,
        includeImage: true,
    }

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
            data: undefined,
            error: null,
            isError: false,
            isIdle: true,
            isPaused: false,
            status: 'idle',
            failureCount: 0,
            failureReason: null,
            reset: jest.fn(),
            mutate: jest.fn(),
            context: undefined,
            variables: undefined,
        }

        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseUpdateJourney.mockReturnValue(mockUpdateJourney as any)
        mockNotify.mockReturnValue(() => Promise.resolve())

        // Mock query client methods
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
                () => useJourneyUpdateHandler(defaultParams),
                {
                    wrapper,
                },
            )

            const updateResult = await result.current.handleUpdate({
                journeyState: JourneyStatusEnum.Active,
                journeyMessageInstructions: 'Custom instructions',
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                journeyId: 'journey-123',
                params: {
                    state: JourneyStatusEnum.Active,
                    message_instructions: 'Custom instructions',
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
            expect(updateResult).toBe(mockResponse)
            expect(mockDispatch).not.toHaveBeenCalled()
        })

        it('should handle journey update without message instructions', async () => {
            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultParams),
                {
                    wrapper,
                },
            )

            await result.current.handleUpdate({
                journeyState: JourneyStatusEnum.Paused,
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                journeyId: 'journey-123',
                params: {
                    state: JourneyStatusEnum.Paused,
                    message_instructions: undefined,
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
        })

        it('should not include journey configs when all values are undefined or null', async () => {
            const paramsWithoutConfigs = {
                integrationId: 100,
                journeyId: 'journey-123',
                followUpValue: undefined,
                isDiscountEnabled: undefined,
                discountValue: undefined,
                phoneNumberValue: undefined,
                discountCodeThresholdValue: undefined,
                includeImage: undefined,
            }

            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () => useJourneyUpdateHandler(paramsWithoutConfigs),
                {
                    wrapper,
                },
            )

            await result.current.handleUpdate({
                journeyState: JourneyStatusEnum.Active,
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                journeyId: 'journey-123',
                params: {
                    state: JourneyStatusEnum.Active,
                    message_instructions: undefined,
                },
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

            const paramsWithoutSms = {
                ...defaultParams,
                phoneNumberValue: phoneNumberWithoutSms,
            }

            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () => useJourneyUpdateHandler(paramsWithoutSms),
                {
                    wrapper,
                },
            )

            await result.current.handleUpdate({
                journeyState: JourneyStatusEnum.Active,
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                journeyId: 'journey-123',
                params: {
                    state: JourneyStatusEnum.Active,
                    message_instructions: undefined,
                },
                journeyConfigs: {
                    max_follow_up_messages: 3,
                    offer_discount: true,
                    max_discount_percent: 10,
                    sms_sender_integration_id: undefined,
                    sms_sender_number: '+1234567890',
                    discount_code_message_threshold: 2,
                    include_image: true,
                },
            })
        })

        it('should throw error when integrationId is missing', async () => {
            const paramsWithoutIntegrationId = {
                ...defaultParams,
                integrationId: undefined,
            }

            const { result } = renderHook(
                () => useJourneyUpdateHandler(paramsWithoutIntegrationId),
                { wrapper },
            )

            await expect(
                result.current.handleUpdate({
                    journeyState: JourneyStatusEnum.Active,
                }),
            ).rejects.toThrow('Missing integration')

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: expect.stringContaining('Error updating journey:'),
                    status: NotificationStatus.Error,
                }),
            )
        })

        it('should throw error when journey id is missing', async () => {
            const paramsWithoutJourneyId = {
                ...defaultParams,
                journeyId: undefined,
            }

            const { result } = renderHook(
                () => useJourneyUpdateHandler(paramsWithoutJourneyId),
                { wrapper },
            )

            await expect(
                result.current.handleUpdate({
                    journeyState: JourneyStatusEnum.Active,
                }),
            ).rejects.toThrow('Missing journey')
        })

        it('should handle API errors and dispatch notification', async () => {
            const apiError = new Error('API request failed')
            mockMutateAsync.mockRejectedValue(apiError)

            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultParams),
                {
                    wrapper,
                },
            )

            await expect(
                result.current.handleUpdate({
                    journeyState: JourneyStatusEnum.Active,
                }),
            ).rejects.toThrow('API request failed')

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message:
                        'Error updating journey: Error: API request failed',
                    status: NotificationStatus.Error,
                }),
            )
        })

        it('should handle discount value as string and convert to number', async () => {
            const paramsWithStringDiscount = {
                ...defaultParams,
                discountValue: '25',
            }

            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () => useJourneyUpdateHandler(paramsWithStringDiscount),
                { wrapper },
            )

            await result.current.handleUpdate({
                journeyState: JourneyStatusEnum.Active,
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
            const paramsWithEmptyDiscount = {
                ...defaultParams,
                discountValue: '',
            }

            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () => useJourneyUpdateHandler(paramsWithEmptyDiscount),
                { wrapper },
            )

            await result.current.handleUpdate({
                journeyState: JourneyStatusEnum.Active,
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        max_discount_percent: undefined,
                    }),
                }),
            )
        })
    })

    describe('loading and success states', () => {
        it('should return loading state from useUpdateJourney', () => {
            mockUpdateJourney.isLoading = true

            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultParams),
                {
                    wrapper,
                },
            )

            expect(result.current.isLoading).toBe(true)
            expect(result.current.isSuccess).toBe(false)
        })

        it('should return success state from useUpdateJourney', () => {
            mockUpdateJourney.isSuccess = true

            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultParams),
                {
                    wrapper,
                },
            )

            expect(result.current.isLoading).toBe(false)
            expect(result.current.isSuccess).toBe(true)
        })
    })

    describe('dependency changes', () => {
        it('should recreate callback when dependencies change', () => {
            const { result, rerender } = renderHook(
                ({ params }) => useJourneyUpdateHandler(params),
                {
                    wrapper,
                    initialProps: { params: defaultParams },
                },
            )

            const initialCallback = result.current.handleUpdate

            // Change a dependency
            const updatedParams = {
                ...defaultParams,
                followUpValue: 5,
            }

            rerender({ params: updatedParams })

            expect(result.current.handleUpdate).not.toBe(initialCallback)
        })
    })

    describe('edge cases', () => {
        it('should handle null message instructions', async () => {
            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultParams),
                {
                    wrapper,
                },
            )

            await result.current.handleUpdate({
                journeyState: JourneyStatusEnum.Active,
                journeyMessageInstructions: null,
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        message_instructions: null,
                    }),
                }),
            )
        })

        it('should handle journey with empty id string', async () => {
            const paramsWithEmptyJourneyId = {
                ...defaultParams,
                journeyId: '',
            }

            const { result } = renderHook(
                () => useJourneyUpdateHandler(paramsWithEmptyJourneyId),
                { wrapper },
            )

            await expect(
                result.current.handleUpdate({
                    journeyState: JourneyStatusEnum.Active,
                }),
            ).rejects.toThrow('Missing journey')
        })

        it('should include journey configs when at least one value is defined', async () => {
            const paramsWithSingleConfig = {
                integrationId: 100,
                journeyId: 'journey-123',
                followUpValue: 1, // Only this is defined
                isDiscountEnabled: false,
                discountValue: undefined,
                phoneNumberValue: undefined,
                discountCodeThresholdValue: undefined,
                includeImage: undefined,
            }

            const mockResponse = { id: 'journey-123', updated: true }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () => useJourneyUpdateHandler(paramsWithSingleConfig),
                { wrapper },
            )

            await result.current.handleUpdate({
                journeyState: JourneyStatusEnum.Active,
            })

            expect(mockMutateAsync).toHaveBeenCalledWith({
                journeyId: 'journey-123',
                params: {
                    state: JourneyStatusEnum.Active,
                    message_instructions: undefined,
                },
                journeyConfigs: {
                    max_follow_up_messages: 1,
                    offer_discount: false,
                    max_discount_percent: undefined,
                    sms_sender_integration_id: undefined,
                    sms_sender_number: undefined,
                    discount_code_message_threshold: undefined,
                    include_image: undefined,
                },
            })
        })
    })
})
