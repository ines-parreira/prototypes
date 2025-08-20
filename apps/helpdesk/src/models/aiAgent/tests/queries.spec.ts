import { fromJS } from 'immutable'

import * as accountFixtures from 'fixtures/account'
import {
    storeConfigurationKeys,
    useOptOutAiAgentTrialUpgradeMutation,
    useOptOutSalesTrialUpgradeMutation,
    useStartAiAgentTrialMutation,
    useStartSalesTrialMutation,
    useUpgradeSubscriptionMutation,
} from 'models/aiAgent/queries'
import * as configurationResources from 'models/aiAgent/resources/configuration'
import { billingKeys } from 'models/billing/queries'
import { initialState } from 'state/currentAccount/reducers'
import * as notificationActions from 'state/notifications/actions'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

jest.mock('models/aiAgent/resources/configuration')
jest.mock('state/notifications/actions')

const defaultState = {
    currentAccount: initialState.mergeDeep(
        fromJS({
            ...accountFixtures.account,
            domain: 'test-domain',
        }),
    ),
}

describe('aiAgent queries', () => {
    let mockStartSalesTrial: jest.MockedFunction<
        typeof configurationResources.startSalesTrial
    >
    let mockOptOutSalesTrialUpgrade: jest.MockedFunction<
        typeof configurationResources.optOutSalesTrialUpgrade
    >
    let mockOptOutAiAgentTrialUpgrade: jest.MockedFunction<
        typeof configurationResources.optOutAiAgentTrialUpgrade
    >
    let mockStartAiAgentTrial: jest.MockedFunction<
        typeof configurationResources.startAiAgentTrial
    >
    let mockUpgradeSubscription: jest.MockedFunction<
        typeof configurationResources.upgradeSubscription
    >

    beforeEach(() => {
        mockStartSalesTrial = jest.mocked(
            configurationResources.startSalesTrial,
        )
        mockOptOutSalesTrialUpgrade = jest.mocked(
            configurationResources.optOutSalesTrialUpgrade,
        )
        mockOptOutAiAgentTrialUpgrade = jest.mocked(
            configurationResources.optOutAiAgentTrialUpgrade,
        )
        mockStartAiAgentTrial = jest.mocked(
            configurationResources.startAiAgentTrial,
        )
        mockUpgradeSubscription = jest.mocked(
            configurationResources.upgradeSubscription,
        )
    })

    describe('useStartSalesTrialMutation', () => {
        it('should call startSalesTrial with correct parameters', async () => {
            mockStartSalesTrial.mockResolvedValue({ success: true })

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStartSalesTrialMutation(),
                defaultState,
            )

            await result.current.mutateAsync(['test-store'])

            expect(mockStartSalesTrial).toHaveBeenCalledWith(
                'test-domain',
                'shopify',
                'test-store',
            )
        })

        it('should invalidate store configuration queries on success', async () => {
            mockStartSalesTrial.mockResolvedValue({ success: true })

            const { result, queryClient } =
                renderHookWithStoreAndQueryClientProvider(
                    () => useStartSalesTrialMutation(),
                    defaultState,
                )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync(['test-store'])

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: storeConfigurationKeys.all(),
            })
        })

        it('should handle overrides correctly', async () => {
            const onSuccessMock = jest.fn()
            mockStartSalesTrial.mockResolvedValue({ success: true })

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () =>
                    useStartSalesTrialMutation({
                        onSuccess: onSuccessMock,
                    }),
                defaultState,
            )

            await result.current.mutateAsync(['test-store'])

            expect(onSuccessMock).toHaveBeenCalled()
        })
    })

    describe('useOptOutSalesTrialUpgradeMutation', () => {
        it('should call optOutSalesTrialUpgrade with correct parameters', async () => {
            mockOptOutSalesTrialUpgrade.mockResolvedValue({ success: true })

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useOptOutSalesTrialUpgradeMutation(),
                defaultState,
            )

            await result.current.mutateAsync([])

            expect(mockOptOutSalesTrialUpgrade).toHaveBeenCalledWith(
                'test-domain',
            )
        })

        it('should invalidate store configuration queries on success', async () => {
            mockOptOutSalesTrialUpgrade.mockResolvedValue({ success: true })

            const { result, queryClient } =
                renderHookWithStoreAndQueryClientProvider(
                    () => useOptOutSalesTrialUpgradeMutation(),
                    defaultState,
                )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync([])

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: storeConfigurationKeys.all(),
            })
        })

        it('should handle overrides correctly', async () => {
            const onSuccessMock = jest.fn()
            mockOptOutSalesTrialUpgrade.mockResolvedValue({ success: true })

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () =>
                    useOptOutSalesTrialUpgradeMutation({
                        onSuccess: onSuccessMock,
                    }),
                defaultState,
            )

            await result.current.mutateAsync([])

            expect(onSuccessMock).toHaveBeenCalled()
        })

        it('should dispatch error notification on failure', async () => {
            const mockError = new Error('Network error')
            const mockNotify = jest.mocked(notificationActions.notify)
            mockNotify.mockReturnValue(jest.fn())

            mockOptOutSalesTrialUpgrade.mockRejectedValue(mockError)

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useOptOutSalesTrialUpgradeMutation(),
                defaultState,
            )

            await expect(result.current.mutateAsync([])).rejects.toThrow(
                'Network error',
            )

            expect(mockNotify).toHaveBeenCalledWith({
                message: 'Failed to upgrade plan. Please try again later.',
                status: 'error',
            })
        })

        it('should call onError override when provided and error occurs', async () => {
            const mockError = new Error('Network error')
            const onErrorMock = jest.fn()
            mockOptOutSalesTrialUpgrade.mockRejectedValue(mockError)

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () =>
                    useOptOutSalesTrialUpgradeMutation({
                        onError: onErrorMock,
                    }),
                defaultState,
            )

            try {
                await result.current.mutateAsync([])
            } catch {
                // Expected to throw
            }

            expect(onErrorMock).toHaveBeenCalledWith(mockError, [], undefined)
        })
    })

    describe('useStartAiAgentTrialMutation', () => {
        it('should call startAiAgentTrial with correct parameters', async () => {
            mockStartAiAgentTrial.mockResolvedValue({ success: true })

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useStartAiAgentTrialMutation(),
                defaultState,
            )

            await result.current.mutateAsync(['shopify', 'test-store', true])

            expect(mockStartAiAgentTrial).toHaveBeenCalledWith(
                'test-domain',
                'shopify',
                'test-store',
                true,
            )
        })

        it('should invalidate store configuration queries on success', async () => {
            mockStartAiAgentTrial.mockResolvedValue({ success: true })

            const { result, queryClient } =
                renderHookWithStoreAndQueryClientProvider(
                    () => useStartAiAgentTrialMutation(),
                    defaultState,
                )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync(['shopify', 'test-store', true])

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: storeConfigurationKeys.all(),
            })
        })

        it('should handle overrides correctly', async () => {
            const onSuccessMock = jest.fn()
            mockStartAiAgentTrial.mockResolvedValue({ success: true })

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () =>
                    useStartAiAgentTrialMutation({
                        onSuccess: onSuccessMock,
                    }),
                defaultState,
            )

            await result.current.mutateAsync(['shopify', 'test-store', true])

            expect(onSuccessMock).toHaveBeenCalled()
        })

        it('should call onError override when provided and error occurs', async () => {
            const mockError = new Error('Network error')
            const onErrorMock = jest.fn()
            mockStartAiAgentTrial.mockRejectedValue(mockError)

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () =>
                    useStartAiAgentTrialMutation({
                        onError: onErrorMock,
                    }),
                defaultState,
            )

            try {
                await result.current.mutateAsync([
                    'shopify',
                    'test-store',
                    true,
                ])
            } catch {
                // Expected to throw
            }

            expect(onErrorMock).toHaveBeenCalledWith(
                mockError,
                ['shopify', 'test-store', true],
                undefined,
            )
        })
    })

    describe('useOptOutAiAgentTrialUpgradeMutation', () => {
        it('should call optOutAiAgentTrialUpgrade with correct parameters', async () => {
            mockOptOutAiAgentTrialUpgrade.mockResolvedValue({ success: true })

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useOptOutAiAgentTrialUpgradeMutation(),
                defaultState,
            )

            await result.current.mutateAsync([])

            expect(mockOptOutAiAgentTrialUpgrade).toHaveBeenCalledWith(
                'test-domain',
            )
        })

        it('should invalidate store configuration queries on success', async () => {
            mockOptOutAiAgentTrialUpgrade.mockResolvedValue({ success: true })

            const { result, queryClient } =
                renderHookWithStoreAndQueryClientProvider(
                    () => useOptOutAiAgentTrialUpgradeMutation(),
                    defaultState,
                )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync([])

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: storeConfigurationKeys.all(),
            })
        })

        it('should handle overrides correctly', async () => {
            const onSuccessMock = jest.fn()
            mockOptOutAiAgentTrialUpgrade.mockResolvedValue({ success: true })

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () =>
                    useOptOutAiAgentTrialUpgradeMutation({
                        onSuccess: onSuccessMock,
                    }),
                defaultState,
            )

            await result.current.mutateAsync([])

            expect(onSuccessMock).toHaveBeenCalled()
        })

        it('should call onError override when provided and error occurs', async () => {
            const mockError = new Error('Network error')
            const onErrorMock = jest.fn()
            mockOptOutAiAgentTrialUpgrade.mockRejectedValue(mockError)

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () =>
                    useOptOutAiAgentTrialUpgradeMutation({
                        onError: onErrorMock,
                    }),
                defaultState,
            )

            try {
                await result.current.mutateAsync([])
            } catch {
                // Expected to throw
            }

            expect(onErrorMock).toHaveBeenCalledWith(mockError, [], undefined)
        })
    })

    describe('useUpgradeSubscriptionMutation', () => {
        it('should call upgradeSubscription with correct parameters', async () => {
            mockUpgradeSubscription.mockResolvedValue({ success: true })

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () => useUpgradeSubscriptionMutation(),
                defaultState,
            )

            await result.current.mutateAsync([])

            expect(mockUpgradeSubscription).toHaveBeenCalledWith('test-domain')
        })

        it('should invalidate store configuration and billing queries on success', async () => {
            mockUpgradeSubscription.mockResolvedValue({ success: true })

            const { result, queryClient } =
                renderHookWithStoreAndQueryClientProvider(
                    () => useUpgradeSubscriptionMutation(),
                    defaultState,
                )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync([])

            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: storeConfigurationKeys.all(),
            })
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: billingKeys.all,
            })
        })

        it('should handle overrides correctly', async () => {
            const onSuccessMock = jest.fn()
            mockUpgradeSubscription.mockResolvedValue({ success: true })

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () =>
                    useUpgradeSubscriptionMutation({
                        onSuccess: onSuccessMock,
                    }),
                defaultState,
            )

            await result.current.mutateAsync([])

            expect(onSuccessMock).toHaveBeenCalled()
        })

        it('should call onError override when provided and error occurs', async () => {
            const mockError = new Error('Network error')
            const onErrorMock = jest.fn()
            mockUpgradeSubscription.mockRejectedValue(mockError)

            const { result } = renderHookWithStoreAndQueryClientProvider(
                () =>
                    useUpgradeSubscriptionMutation({
                        onError: onErrorMock,
                    }),
                defaultState,
            )

            try {
                await result.current.mutateAsync([])
            } catch {
                // Expected to throw
            }

            expect(onErrorMock).toHaveBeenCalledWith(mockError, [], undefined)
        })

        it('should call overrides in correct order', async () => {
            const callOrder: string[] = []
            const onSuccessMock = jest.fn(() => callOrder.push('override'))
            const invalidateQueriesSpy = jest.fn(() =>
                callOrder.push('invalidate'),
            )

            mockUpgradeSubscription.mockResolvedValue({ success: true })

            const { result, queryClient } =
                renderHookWithStoreAndQueryClientProvider(
                    () =>
                        useUpgradeSubscriptionMutation({
                            onSuccess: onSuccessMock,
                        }),
                    defaultState,
                )

            queryClient.invalidateQueries = invalidateQueriesSpy as any

            await result.current.mutateAsync([])

            expect(callOrder).toEqual(['invalidate', 'invalidate', 'override'])
        })
    })
})
