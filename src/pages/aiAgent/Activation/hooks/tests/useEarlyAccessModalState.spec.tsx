import React, { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import createMockStore from 'redux-mock-store'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    useBillingState,
    useEarlyAccessAutomatePlan,
} from 'models/billing/queries'
import { useCurrentPriceIds } from 'pages/settings/new_billing/hooks/useGetCurrentPriceIds'
import { getCurrentPlansByProduct } from 'state/billing/selectors'
import { updateSubscription } from 'state/currentAccount/actions'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'

import { useEarlyAccessModalState } from '../useEarlyAccessModalState'

jest.mock('models/billing/queries')
const mockUseEarlyAccessAutomatePlan = jest.mocked(useEarlyAccessAutomatePlan)
const mockUseBillingState = jest.mocked(useBillingState)
jest.mock('pages/settings/new_billing/hooks/useGetCurrentPriceIds')
const mockUseCurrentPriceIds = jest.mocked(useCurrentPriceIds)

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('state/currentUser/selectors')
const mockGetCurrentUser = jest.mocked(getCurrentUser)

jest.mock('state/currentAccount/selectors')
const mockGetCurrentAccountState = jest.mocked(getCurrentAccountState)

jest.mock('state/billing/selectors')
const mockGetCurrentPlansByProduct = jest.mocked(getCurrentPlansByProduct)

jest.mock('core/flags')
const mockUseFlag = jest.mocked(useFlag)

jest.mock('state/currentAccount/actions')
const mockUpdateSubscription = jest.mocked(updateSubscription)

const mockStore = createMockStore()

describe('useEarlyAccessModalState', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockImplementation(
            (key, defaultValue) =>
                (({ [FeatureFlagKey.AiAgentActivation]: true }) as any)[key] ??
                defaultValue,
        )
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={mockStore()}>{children}</Provider>
    )

    describe('when user is admin and plan is not of 6th generation', () => {
        beforeEach(() => {
            mockUseEarlyAccessAutomatePlan.mockReturnValue({
                data: {},
                isLoading: false,
            } as any)
            mockUseBillingState.mockReturnValue({
                data: {
                    current_plans: {
                        automate: { generation: 5 },
                    },
                },
                isLoading: false,
            } as any)
            mockGetCurrentUser.mockReturnValue(
                fromJS({ role: { name: 'admin' } }),
            )
            mockGetCurrentAccountState.mockReturnValue(fromJS({ id: 1 }))
            mockGetCurrentPlansByProduct.mockReturnValue(fromJS({}))
            mockUseCurrentPriceIds.mockReturnValue([])
            mockUpdateSubscription.mockReturnValue({
                type: 'dummy-action',
            } as any)
        })

        it('should set isPreviewModalVisible to true only on first render', () => {
            const { result } = renderHook(
                () => useEarlyAccessModalState({ hasActivationEnabled: true }),
                { wrapper },
            )

            expect(result.current.isPreviewModalVisible).toBeTruthy()

            const { result: result2 } = renderHook(
                () => useEarlyAccessModalState({ hasActivationEnabled: true }),
                { wrapper },
            )

            expect(result2.current.isPreviewModalVisible).toBeFalsy()
        })

        it('should not set isPreviewModalVisible to true on first render if autoDisplayDisabled is true', () => {
            const { result } = renderHook(
                () =>
                    useEarlyAccessModalState({
                        hasActivationEnabled: true,
                        autoDisplayDisabled: true,
                    }),
                { wrapper },
            )

            expect(result.current.isPreviewModalVisible).toBeFalsy()
        })

        it('should set focusActivationModal search parameters after upgrading the subscription', async () => {
            const mockPushState = jest.fn()
            window.history.pushState = mockPushState

            const { result } = renderHook(
                () => useEarlyAccessModalState({ hasActivationEnabled: true }),
                { wrapper },
            )

            await act(async () => {
                await result.current.handleSubscriptionUpdate()
            })

            expect(mockPushState).toHaveBeenCalledWith(
                null,
                '',
                'http://localhost/?focusActivationModal=true',
            )
        })
    })
})
