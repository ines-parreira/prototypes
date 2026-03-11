import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { JOURNEY_TYPES } from 'AIJourney/constants'
import { useCreateNewJourney } from 'AIJourney/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useJourneyCreateHandler } from './useJourneyCreateHandler'

jest.mock('AIJourney/queries', () => ({
    useCreateNewJourney: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => jest.fn())

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

const mockUseCreateNewJourney = jest.mocked(useCreateNewJourney)
const mockUseAppDispatch = jest.mocked(useAppDispatch)
const mockNotify = jest.mocked(notify)

describe('useJourneyCreateHandler', () => {
    let queryClient: QueryClient
    let mockDispatch: jest.Mock
    let mockMutateAsync: jest.Mock

    const defaultHookParams = {
        integrationId: 100,
        integrationName: 'Test Store',
        journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
    }

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        })
        mockDispatch = jest.fn()
        mockMutateAsync = jest.fn()

        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseCreateNewJourney.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: false,
            isSuccess: false,
        } as any)
        mockNotify.mockReturnValue(() => Promise.resolve() as any)

        jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(
            undefined,
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('guard clause - missing integration', () => {
        it('throws and dispatches error when integrationId is missing', async () => {
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
                await expect(result.current.handleCreate({})).rejects.toThrow(
                    'Missing integration information',
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: expect.stringContaining(
                        'Error creating new journey:',
                    ),
                    status: NotificationStatus.Error,
                }),
            )
            expect(mockMutateAsync).not.toHaveBeenCalled()
        })

        it('throws and dispatches error when integrationName is missing', async () => {
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
                await expect(result.current.handleCreate({})).rejects.toThrow(
                    'Missing integration information',
                )
            })

            expect(mockMutateAsync).not.toHaveBeenCalled()
        })
    })

    describe('successful creation', () => {
        it('calls mutateAsync with correct base params and returns the result', async () => {
            const mockResponse = { id: 'journey-123' }
            mockMutateAsync.mockResolvedValue(mockResponse)

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            let returnValue: unknown
            await act(async () => {
                returnValue = await result.current.handleCreate({
                    phoneNumberIntegrationId: 1,
                    phoneNumber: '+1234567890',
                    followUpValue: 2,
                    includeImage: true,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        store_integration_id: 100,
                        store_name: 'Test Store',
                    }),
                    journeyConfigs: expect.objectContaining({
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1234567890',
                        max_follow_up_messages: 2,
                        include_image: true,
                    }),
                }),
            )
            expect(returnValue).toBe(mockResponse)
        })

        it('invalidates queries after successful creation', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({})
            })

            expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ['journeys'],
            })
        })

        it('does not dispatch an error notification on success', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({})
            })

            expect(mockDispatch).not.toHaveBeenCalled()
        })
    })

    describe('discountValue handling', () => {
        it('converts a truthy discountValue to a number', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({ discountValue: 25 })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        max_discount_percent: 25,
                    }),
                }),
            )
        })

        it('sets max_discount_percent to undefined when discountValue is 0 (falsy)', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({ discountValue: 0 })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        max_discount_percent: undefined,
                    }),
                }),
            )
        })

        it('sets max_discount_percent to undefined when discountValue is null', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({ discountValue: null })
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

    describe('discount_code_message_threshold handling', () => {
        it('includes discountCodeThresholdValue when isDiscountEnabled is true', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    isDiscountEnabled: true,
                    discountCodeThresholdValue: 3,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        discount_code_message_threshold: 3,
                    }),
                }),
            )
        })

        it('sets discount_code_message_threshold to undefined when isDiscountEnabled is false', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    isDiscountEnabled: false,
                    discountCodeThresholdValue: 3,
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
    })

    describe('campaign params handling', () => {
        it('includes campaign object when campaignTitle is provided', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })

            const { result } = renderHook(
                () =>
                    useJourneyCreateHandler({
                        ...defaultHookParams,
                        journeyType: JOURNEY_TYPES.CAMPAIGN,
                    }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    campaignTitle: 'Summer Sale',
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        campaign: { title: 'Summer Sale' },
                    }),
                }),
            )
        })

        it('sets campaign to undefined when campaignTitle is absent', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({})
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        campaign: undefined,
                    }),
                }),
            )
        })

        it('passes audience lists to params', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({
                    includedAudienceListIds: ['list-1', 'list-2'],
                    excludedAudienceListIds: ['list-3'],
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        included_audience_list_ids: ['list-1', 'list-2'],
                        excluded_audience_list_ids: ['list-3'],
                    }),
                }),
            )
        })
    })

    describe('optional configs - presence checks', () => {
        it('includes inactive_days when inactiveDays is defined (including 0 and null)', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })
            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            for (const value of [30, 0, null]) {
                mockMutateAsync.mockClear()
                await act(async () => {
                    await result.current.handleCreate({ inactiveDays: value })
                })
                expect(mockMutateAsync).toHaveBeenCalledWith(
                    expect.objectContaining({
                        journeyConfigs: expect.objectContaining({
                            inactive_days: value,
                        }),
                    }),
                )
            }
        })

        it('omits inactive_days when inactiveDays is undefined', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })
            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({})
            })

            const call = mockMutateAsync.mock.calls[0][0]
            expect(call.journeyConfigs).not.toHaveProperty('inactive_days')
        })

        it('includes cooldown_days when cooldownDays is defined (including 0 and null)', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })
            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            for (const value of [7, 0, null]) {
                mockMutateAsync.mockClear()
                await act(async () => {
                    await result.current.handleCreate({ cooldownDays: value })
                })
                expect(mockMutateAsync).toHaveBeenCalledWith(
                    expect.objectContaining({
                        journeyConfigs: expect.objectContaining({
                            cooldown_days: value,
                        }),
                    }),
                )
            }
        })

        it('omits cooldown_days when cooldownDays is undefined', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })
            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({})
            })

            const call = mockMutateAsync.mock.calls[0][0]
            expect(call.journeyConfigs).not.toHaveProperty('cooldown_days')
        })

        it('includes wait_time_minutes when waitTimeMinutes is defined (including 0)', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })
            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            for (const value of [15, 0]) {
                mockMutateAsync.mockClear()
                await act(async () => {
                    await result.current.handleCreate({
                        waitTimeMinutes: value,
                    })
                })
                expect(mockMutateAsync).toHaveBeenCalledWith(
                    expect.objectContaining({
                        journeyConfigs: expect.objectContaining({
                            wait_time_minutes: value,
                        }),
                    }),
                )
            }
        })

        it('omits wait_time_minutes when waitTimeMinutes is undefined', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })
            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({})
            })

            const call = mockMutateAsync.mock.calls[0][0]
            expect(call.journeyConfigs).not.toHaveProperty('wait_time_minutes')
        })

        it('includes post_purchase_wait_minutes when postPurchaseWaitMinutes is defined (including 0)', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })
            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            for (const value of [60, 0]) {
                mockMutateAsync.mockClear()
                await act(async () => {
                    await result.current.handleCreate({
                        postPurchaseWaitMinutes: value,
                    })
                })
                expect(mockMutateAsync).toHaveBeenCalledWith(
                    expect.objectContaining({
                        journeyConfigs: expect.objectContaining({
                            post_purchase_wait_minutes: value,
                        }),
                    }),
                )
            }
        })

        it('omits post_purchase_wait_minutes when postPurchaseWaitMinutes is undefined', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })
            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({})
            })

            const call = mockMutateAsync.mock.calls[0][0]
            expect(call.journeyConfigs).not.toHaveProperty(
                'post_purchase_wait_minutes',
            )
        })

        it('includes target_order_status when targetOrderStatus is truthy', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })
            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            for (const value of ['order_placed', 'order_fulfilled'] as const) {
                mockMutateAsync.mockClear()
                await act(async () => {
                    await result.current.handleCreate({
                        targetOrderStatus: value,
                    })
                })
                expect(mockMutateAsync).toHaveBeenCalledWith(
                    expect.objectContaining({
                        journeyConfigs: expect.objectContaining({
                            target_order_status: value,
                        }),
                    }),
                )
            }
        })

        it('omits target_order_status when targetOrderStatus is undefined', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })
            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleCreate({})
            })

            const call = mockMutateAsync.mock.calls[0][0]
            expect(call.journeyConfigs).not.toHaveProperty(
                'target_order_status',
            )
        })

        it('passes uploadedImageAttachment as media_urls', async () => {
            mockMutateAsync.mockResolvedValue({ id: 'journey-123' })
            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            const attachment = [
                {
                    url: 'https://example.com/img.png',
                    name: 'img.png',
                    content_type: 'image/png',
                },
            ]

            await act(async () => {
                await result.current.handleCreate({
                    uploadedImageAttachment: attachment,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        media_urls: attachment,
                    }),
                }),
            )
        })
    })

    describe('journey type mapping', () => {
        it.each([
            [JOURNEY_TYPES.CART_ABANDONMENT, 'cart_abandoned'],
            [JOURNEY_TYPES.SESSION_ABANDONMENT, 'session_abandoned'],
            [JOURNEY_TYPES.WIN_BACK, 'win_back'],
            [JOURNEY_TYPES.WELCOME, 'welcome'],
            [JOURNEY_TYPES.POST_PURCHASE, 'post_purchase'],
            [JOURNEY_TYPES.CAMPAIGN, 'campaign'],
        ])(
            'maps %s to the correct API type',
            async (journeyType, expectedType) => {
                mockMutateAsync.mockResolvedValue({ id: 'journey-123' })

                const { result } = renderHook(
                    () =>
                        useJourneyCreateHandler({
                            ...defaultHookParams,
                            journeyType,
                        }),
                    { wrapper },
                )

                await act(async () => {
                    await result.current.handleCreate({})
                })

                expect(mockMutateAsync).toHaveBeenCalledWith(
                    expect.objectContaining({
                        params: expect.objectContaining({
                            type: expectedType,
                        }),
                    }),
                )
            },
        )
    })

    describe('error handling', () => {
        it('dispatches error notification and rethrows when mutateAsync fails', async () => {
            const apiError = new Error('API request failed')
            mockMutateAsync.mockRejectedValue(apiError)

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await expect(result.current.handleCreate({})).rejects.toThrow(
                    'API request failed',
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message:
                        'Error creating new journey: Error: API request failed',
                    status: NotificationStatus.Error,
                }),
            )
        })

        it('does not call invalidateQueries when mutateAsync fails', async () => {
            mockMutateAsync.mockRejectedValue(new Error('API failed'))

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await expect(result.current.handleCreate({})).rejects.toThrow()
            })

            expect(queryClient.invalidateQueries).not.toHaveBeenCalled()
        })
    })

    describe('loading and success states', () => {
        it('exposes isLoading from useCreateNewJourney', () => {
            mockUseCreateNewJourney.mockReturnValue({
                mutateAsync: mockMutateAsync,
                isLoading: true,
                isSuccess: false,
            } as any)

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('exposes isSuccess from useCreateNewJourney', () => {
            mockUseCreateNewJourney.mockReturnValue({
                mutateAsync: mockMutateAsync,
                isLoading: false,
                isSuccess: true,
            } as any)

            const { result } = renderHook(
                () => useJourneyCreateHandler(defaultHookParams),
                { wrapper },
            )

            expect(result.current.isSuccess).toBe(true)
        })
    })
})
