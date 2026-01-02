import {
    aiAgentGen6PlanQuery,
    billingKeys,
    useUpgradeAiAgentSubscriptionGeneration6Plan,
} from 'models/billing/queries'
import * as billingResources from 'models/billing/resources'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

jest.mock('models/billing/resources')

describe('billing queries', () => {
    let mockUpgradeAiAgentSubscriptionGeneration6Plan: jest.MockedFunction<
        typeof billingResources.upgradeAiAgentSubscriptionGeneration6Plan
    >

    beforeEach(() => {
        mockUpgradeAiAgentSubscriptionGeneration6Plan = jest.mocked(
            billingResources.upgradeAiAgentSubscriptionGeneration6Plan,
        )
    })

    describe('useUpgradeAiAgentSubscriptionGeneration6Plan', () => {
        it('should call upgradeAiAgentSubscriptionGeneration6Plan mutation function', async () => {
            const mockResponse = { success: true }
            mockUpgradeAiAgentSubscriptionGeneration6Plan.mockResolvedValue(
                mockResponse,
            )

            const { result } = renderHookWithStoreAndQueryClientProvider(() =>
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

            const { result, queryClient } =
                renderHookWithStoreAndQueryClientProvider(() =>
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

            const { result, queryClient } =
                renderHookWithStoreAndQueryClientProvider(() =>
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

            const { result } = renderHookWithStoreAndQueryClientProvider(() =>
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

            const { result } = renderHookWithStoreAndQueryClientProvider(() =>
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

            const { result } = renderHookWithStoreAndQueryClientProvider(() =>
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

            const { result, queryClient } =
                renderHookWithStoreAndQueryClientProvider(() =>
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

            const { result } = renderHookWithStoreAndQueryClientProvider(() =>
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
})
