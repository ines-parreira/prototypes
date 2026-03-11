import { act, renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useUpdateJourney } from 'AIJourney/queries'
import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useJourneyUpdateHandler } from './useUpdateJourneyHandler'

jest.mock('state/notifications/actions', () => ({
    notify: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => jest.fn())

jest.mock('AIJourney/queries', () => ({
    useUpdateJourney: jest.fn(),
}))

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: jest.fn(),
}))

const mockUseAppDispatch = jest.mocked(useAppDispatch)
const mockUseUpdateJourney = jest.mocked(useUpdateJourney)
const mockUseQueryClient = require('@tanstack/react-query')
    .useQueryClient as jest.Mock

describe('useJourneyUpdateHandler', () => {
    const mockDispatch = jest.fn()
    const mockMutateAsync = jest.fn()
    const mockInvalidateQueries = jest.fn()
    const mockStore = configureMockStore([thunk])()

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={mockStore}>{children}</Provider>
    )

    const defaultHookParams = {
        integrationId: 1,
        journeyId: 'journey-123',
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAppDispatch.mockReturnValue(mockDispatch)

        mockUseUpdateJourney.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isLoading: false,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpdateJourney>)

        mockUseQueryClient.mockReturnValue({
            invalidateQueries: mockInvalidateQueries,
        })

        mockMutateAsync.mockResolvedValue({ id: 'journey-123' })
        mockInvalidateQueries.mockResolvedValue(undefined)
    })

    describe('guard conditions', () => {
        it('should throw and dispatch error when integrationId is missing', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler({ journeyId: 'journey-123' }),
                { wrapper },
            )

            await act(async () => {
                await expect(result.current.handleUpdate({})).rejects.toThrow(
                    'Missing integration',
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message:
                        'Error updating journey: Error: Missing integration',
                    status: NotificationStatus.Error,
                }),
            )
        })

        it('should throw and dispatch error when both journeyId and id are missing', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler({ integrationId: 1 }),
                { wrapper },
            )

            await act(async () => {
                await expect(result.current.handleUpdate({})).rejects.toThrow(
                    'Missing journey',
                )
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: 'Error updating journey: Error: Missing journey',
                    status: NotificationStatus.Error,
                }),
            )
        })
    })

    describe('successful update', () => {
        it('should call mutateAsync with journeyId from hook params', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    followUpValue: 2,
                    phoneNumberIntegrationId: 42,
                    phoneNumber: '+1 555-000-0000',
                    includeImage: true,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({ journeyId: 'journey-123' }),
            )
        })

        it('should use id param over journeyId from hook when id is provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({ id: 'override-id' })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({ journeyId: 'override-id' }),
            )
        })

        it('should invalidate queries after successful update', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({ followUpValue: 1 })
            })

            expect(mockInvalidateQueries).toHaveBeenCalledWith(
                expect.objectContaining({ queryKey: ['journeys'] }),
            )
        })

        it('should return the mutation result', async () => {
            const mutationResult = { id: 'journey-123', state: 'active' }
            mockMutateAsync.mockResolvedValue(mutationResult)

            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            let returnValue: unknown
            await act(async () => {
                returnValue = await result.current.handleUpdate({
                    followUpValue: 1,
                })
            })

            expect(returnValue).toEqual(mutationResult)
        })

        it('should not dispatch error notification on success', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({ followUpValue: 1 })
            })

            expect(mockDispatch).not.toHaveBeenCalled()
        })
    })

    describe('error handling', () => {
        it('should dispatch error notification and re-throw when mutation fails', async () => {
            const mutationError = new Error('Mutation failed')
            mockMutateAsync.mockRejectedValue(mutationError)

            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await expect(
                    result.current.handleUpdate({ followUpValue: 1 }),
                ).rejects.toThrow('Mutation failed')
            })

            expect(mockDispatch).toHaveBeenCalledWith(
                notify({
                    message: `Error updating journey: ${mutationError}`,
                    status: NotificationStatus.Error,
                }),
            )
        })
    })

    describe('journey config building', () => {
        it('should convert discountValue to Number when truthy', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    discountValue: 15,
                    isDiscountEnabled: true,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        max_discount_percent: 15,
                    }),
                }),
            )
        })

        it('should set max_discount_percent to undefined when discountValue is 0', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    discountValue: 0,
                    followUpValue: 1,
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

        it('should include campaign object when campaignTitle is provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    campaignTitle: 'Summer Sale',
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        campaign: { title: 'Summer Sale', state: undefined },
                    }),
                }),
            )
        })

        it('should include campaign object when campaignState is provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    campaignState: 'sent' as any,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({
                        campaign: { title: undefined, state: 'sent' },
                    }),
                }),
            )
        })

        it('should set campaign to undefined when neither campaignTitle nor campaignState are provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({ followUpValue: 1 })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({ campaign: undefined }),
                }),
            )
        })

        it('should not include journeyConfigs when all config values are undefined', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({})
            })

            const requestBody = mockMutateAsync.mock.calls[0][0]
            expect(requestBody).not.toHaveProperty('journeyConfigs')
        })

        it('should include journeyConfigs when at least one config value is defined', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({ followUpValue: 1 })
            })

            const requestBody = mockMutateAsync.mock.calls[0][0]
            expect(requestBody).toHaveProperty('journeyConfigs')
        })
    })

    describe('optional configs', () => {
        it('should include inactive_days when inactiveDays is provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    inactiveDays: 30,
                    followUpValue: 1,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        inactive_days: 30,
                    }),
                }),
            )
        })

        it('should not include inactive_days when inactiveDays is not provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({ followUpValue: 1 })
            })

            const requestBody = mockMutateAsync.mock.calls[0][0]
            expect(requestBody.journeyConfigs).not.toHaveProperty(
                'inactive_days',
            )
        })

        it('should include cooldown_days when cooldownDays is provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    cooldownDays: 7,
                    followUpValue: 1,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        cooldown_days: 7,
                    }),
                }),
            )
        })

        it('should not include cooldown_days when cooldownDays is not provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({ followUpValue: 1 })
            })

            const requestBody = mockMutateAsync.mock.calls[0][0]
            expect(requestBody.journeyConfigs).not.toHaveProperty(
                'cooldown_days',
            )
        })

        it('should include wait_time_minutes when waitTimeMinutes is provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    waitTimeMinutes: 60,
                    followUpValue: 1,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        wait_time_minutes: 60,
                    }),
                }),
            )
        })

        it('should not include wait_time_minutes when waitTimeMinutes is not provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({ followUpValue: 1 })
            })

            const requestBody = mockMutateAsync.mock.calls[0][0]
            expect(requestBody.journeyConfigs).not.toHaveProperty(
                'wait_time_minutes',
            )
        })

        it('should include post_purchase_wait_minutes when postPurchaseWaitMinutes is provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    postPurchaseWaitMinutes: 120,
                    followUpValue: 1,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        post_purchase_wait_minutes: 120,
                    }),
                }),
            )
        })

        it('should not include post_purchase_wait_minutes when postPurchaseWaitMinutes is not provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({ followUpValue: 1 })
            })

            const requestBody = mockMutateAsync.mock.calls[0][0]
            expect(requestBody.journeyConfigs).not.toHaveProperty(
                'post_purchase_wait_minutes',
            )
        })

        it('should include target_order_status when targetOrderStatus is provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({
                    targetOrderStatus: 'order_placed',
                    followUpValue: 1,
                })
            })

            expect(mockMutateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    journeyConfigs: expect.objectContaining({
                        target_order_status: 'order_placed',
                    }),
                }),
            )
        })

        it('should not include target_order_status when not provided', async () => {
            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleUpdate({ followUpValue: 1 })
            })

            const requestBody = mockMutateAsync.mock.calls[0][0]
            expect(requestBody.journeyConfigs).not.toHaveProperty(
                'target_order_status',
            )
        })
    })

    describe('return values', () => {
        it('should return isLoading true when mutation is in flight', () => {
            mockUseUpdateJourney.mockReturnValue({
                mutateAsync: mockMutateAsync,
                isLoading: true,
                isSuccess: false,
            } as unknown as ReturnType<typeof useUpdateJourney>)

            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('should return isSuccess true when mutation has completed', () => {
            mockUseUpdateJourney.mockReturnValue({
                mutateAsync: mockMutateAsync,
                isLoading: false,
                isSuccess: true,
            } as unknown as ReturnType<typeof useUpdateJourney>)

            const { result } = renderHook(
                () => useJourneyUpdateHandler(defaultHookParams),
                { wrapper },
            )

            expect(result.current.isSuccess).toBe(true)
        })
    })
})
