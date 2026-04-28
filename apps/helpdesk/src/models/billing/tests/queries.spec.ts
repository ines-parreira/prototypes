import { createElement } from 'react'

import { renderHook } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { AxiosHeaders } from 'axios'
import { z } from 'zod'

import { billingContact } from 'fixtures/resources'
import {
    aiAgentGen6PlanQuery,
    billingKeys,
    useBillingContact,
    useProductsUsage,
    useUpgradeAiAgentSubscriptionGeneration6Plan,
} from 'models/billing/queries'
import * as billingResources from 'models/billing/resources'
import type { BillingContactDetailResponse } from 'state/billing/types'

jest.mock('models/billing/resources')

type RenderHookOptions = NonNullable<Parameters<typeof renderHook>[1]>

const renderHookWithQueryClient = <TResult>(
    hook: () => TResult,
    options?: RenderHookOptions,
) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    const { wrapper: ExtraWrapper, ...renderHookOptions } = options ?? {}

    const result = renderHook(hook, {
        ...renderHookOptions,
        wrapper: ({ children }) =>
            createElement(
                QueryClientProvider,
                { client: queryClient },
                ExtraWrapper
                    ? createElement(ExtraWrapper, undefined, children)
                    : children,
            ),
    })

    return { ...result, queryClient }
}

describe('billing queries', () => {
    let mockUpgradeAiAgentSubscriptionGeneration6Plan: jest.MockedFunction<
        typeof billingResources.upgradeAiAgentSubscriptionGeneration6Plan
    >

    let mockGetBillingContact: jest.MockedFunction<
        typeof billingResources.getBillingContact
    >
    let mockGetProductsUsage: jest.MockedFunction<
        typeof billingResources.getProductsUsage
    >

    beforeEach(() => {
        mockUpgradeAiAgentSubscriptionGeneration6Plan = jest.mocked(
            billingResources.upgradeAiAgentSubscriptionGeneration6Plan,
        )

        mockGetBillingContact = jest.mocked(billingResources.getBillingContact)
        mockGetProductsUsage = jest.mocked(billingResources.getProductsUsage)
    })

    describe('useBillingContact', () => {
        const buildResponse = async (
            value: BillingContactDetailResponse,
        ): ReturnType<typeof billingResources.getBillingContact> => {
            const headers = new AxiosHeaders()
            return {
                status: 200,
                data: value,
                config: { headers },
                headers: headers,
                statusText: 'OK',
            }
        }

        it('should fetch billing contact successfully', async () => {
            const response = buildResponse(billingContact)
            mockGetBillingContact.mockResolvedValue(response)

            const { result } = renderHook(() => useBillingContact())

            await waitFor(() => expect(result.current.isLoading).toBe(false))

            expect(result.current.data?.data).toEqual(billingContact)
        })

        it('should fail and return undefined if validation fails', async () => {
            mockGetBillingContact.mockImplementation(async () => {
                // Throw a real zod validation error
                const fakeSchema: z.Schema<boolean> = z.boolean()
                fakeSchema.parse(billingContact)

                return buildResponse(billingContact)
            })

            const { result } = renderHook(() => useBillingContact())

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false)
            })

            expect(mockGetBillingContact).toHaveBeenCalled()
            expect(result.current.isError).toEqual(true)
            expect(result.current.data).toBeUndefined()
        })
    })

    describe('useUpgradeAiAgentSubscriptionGeneration6Plan', () => {
        it('should call upgradeAiAgentSubscriptionGeneration6Plan mutation function', async () => {
            const mockResponse = { success: true }
            mockUpgradeAiAgentSubscriptionGeneration6Plan.mockResolvedValue(
                mockResponse,
            )

            const { result } = renderHook(() =>
                useUpgradeAiAgentSubscriptionGeneration6Plan(),
            )

            await result.current.mutateAsync([])

            expect(
                mockUpgradeAiAgentSubscriptionGeneration6Plan,
            ).toHaveBeenCalledTimes(1)
        })

        it('should invalidate billing queries on success', async () => {
            const mockResponse = { success: true }
            mockUpgradeAiAgentSubscriptionGeneration6Plan.mockResolvedValue(
                mockResponse,
            )

            const { result, queryClient } = renderHookWithQueryClient(() =>
                useUpgradeAiAgentSubscriptionGeneration6Plan(),
            )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync([])

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: billingKeys.all,
            })
        })

        it('should invalidate aiAgentGen6Plan query on success', async () => {
            const mockResponse = { success: true }
            mockUpgradeAiAgentSubscriptionGeneration6Plan.mockResolvedValue(
                mockResponse,
            )

            const { result, queryClient } = renderHookWithQueryClient(() =>
                useUpgradeAiAgentSubscriptionGeneration6Plan(),
            )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync([])

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: aiAgentGen6PlanQuery.queryKey,
            })
        })

        it('should call onSuccess override when provided', async () => {
            const mockResponse = { success: true }
            const onSuccessMock = jest.fn()
            mockUpgradeAiAgentSubscriptionGeneration6Plan.mockResolvedValue(
                mockResponse,
            )

            const { result } = renderHook(() =>
                useUpgradeAiAgentSubscriptionGeneration6Plan({
                    onSuccess: onSuccessMock,
                }),
            )

            await result.current.mutateAsync([])

            expect(onSuccessMock).toHaveBeenCalled()
        })

        it('should call onError override when error occurs', async () => {
            const mockError = new Error('Network error')
            const onErrorMock = jest.fn()
            mockUpgradeAiAgentSubscriptionGeneration6Plan.mockRejectedValue(
                mockError,
            )

            const { result } = renderHook(() =>
                useUpgradeAiAgentSubscriptionGeneration6Plan({
                    onError: onErrorMock,
                }),
            )

            try {
                await result.current.mutateAsync([])
            } catch {
                // Expected to throw
            }

            expect(onErrorMock).toHaveBeenCalledWith(mockError, [], undefined)
        })

        it('should propagate error when mutation fails', async () => {
            const mockError = new Error('API error')
            mockUpgradeAiAgentSubscriptionGeneration6Plan.mockRejectedValue(
                mockError,
            )

            const { result } = renderHook(() =>
                useUpgradeAiAgentSubscriptionGeneration6Plan(),
            )

            await expect(result.current.mutateAsync([])).rejects.toThrow(
                'API error',
            )
        })

        it('should not invalidate queries when error occurs', async () => {
            const mockError = new Error('API error')
            mockUpgradeAiAgentSubscriptionGeneration6Plan.mockRejectedValue(
                mockError,
            )

            const { result, queryClient } = renderHookWithQueryClient(() =>
                useUpgradeAiAgentSubscriptionGeneration6Plan(),
            )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            try {
                await result.current.mutateAsync([])
            } catch {
                // Expected to throw
            }

            expect(invalidateQueriesSpy).not.toHaveBeenCalled()
        })

        it('should pass mutation data to onSuccess override', async () => {
            const mockResponse = { success: true, subscriptionId: '123' }
            const onSuccessMock = jest.fn()
            mockUpgradeAiAgentSubscriptionGeneration6Plan.mockResolvedValue(
                mockResponse,
            )

            const { result } = renderHook(() =>
                useUpgradeAiAgentSubscriptionGeneration6Plan({
                    onSuccess: onSuccessMock,
                }),
            )

            await result.current.mutateAsync([])

            expect(onSuccessMock).toHaveBeenCalledWith(
                mockResponse,
                [],
                undefined,
            )
        })
    })

    describe('useProductsUsage', () => {
        it('should successfully fetch products usage', async () => {
            const mockUsage = {
                helpdesk: {
                    data: {
                        extra_tickets_cost_in_cents: 0,
                        num_extra_tickets: 0,
                        num_tickets: 100,
                    },
                    meta: {
                        subscription_start_datetime: '2024-01-01',
                        subscription_end_datetime: '2024-12-31',
                    },
                },
                automation: null,
                voice: null,
                sms: null,
                convert: null,
            }
            mockGetProductsUsage.mockResolvedValue(mockUsage)

            const { result } = renderHook(() => useProductsUsage())

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toEqual(mockUsage)
        })

        it('should handle errors correctly', async () => {
            const mockError = new Error('Failed to fetch')
            mockGetProductsUsage.mockRejectedValue(mockError)

            const { result } = renderHook(() => useProductsUsage())

            await waitFor(() => expect(result.current.isError).toBe(true))

            expect(result.current.error).toEqual(mockError)
        })
    })
})
