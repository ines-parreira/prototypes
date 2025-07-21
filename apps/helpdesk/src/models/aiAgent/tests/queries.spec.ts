import { fromJS } from 'immutable'

import * as accountFixtures from 'fixtures/account'
import {
    storeConfigurationKeys,
    useOptOutSalesTrialUpgradeMutation,
    useStartSalesTrialMutation,
} from 'models/aiAgent/queries'
import * as configurationResources from 'models/aiAgent/resources/configuration'
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

    beforeEach(() => {
        mockStartSalesTrial = jest.mocked(
            configurationResources.startSalesTrial,
        )
        mockOptOutSalesTrialUpgrade = jest.mocked(
            configurationResources.optOutSalesTrialUpgrade,
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
})
