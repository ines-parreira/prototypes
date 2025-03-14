import { renderHook } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import {
    useBillingState,
    useEarlyAccessAutomatePlan,
} from 'models/billing/queries'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'

import { useEarlyAccessModalState } from '../useEarlyAccessModalState'

jest.mock('models/billing/queries')
const mockUseEarlyAccessAutomatePlan = jest.mocked(useEarlyAccessAutomatePlan)
const mockUseBillingState = jest.mocked(useBillingState)

jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())
jest.mock('state/currentUser/selectors')
const mockGetCurrentUser = jest.mocked(getCurrentUser)

jest.mock('state/currentAccount/selectors')
const mockGetCurrentAccountState = jest.mocked(getCurrentAccountState)

jest.mock('core/flags')
const mockUseFlag = jest.mocked(useFlag)

describe('useEarlyAccessModalState', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockImplementation(
            (key, defaultValue) =>
                (({ [FeatureFlagKey.AiAgentActivation]: true }) as any)[key] ??
                defaultValue,
        )
    })

    describe('when user is admin and plan is not of 6th generation', () => {
        it('should set isPreviewModalVisible to true only on first render', () => {
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

            const { result } = renderHook(() =>
                useEarlyAccessModalState({ hasActivationEnabled: true }),
            )

            expect(result.current.isPreviewModalVisible).toBeTruthy()

            const { result: result2 } = renderHook(() =>
                useEarlyAccessModalState({ hasActivationEnabled: true }),
            )

            expect(result2.current.isPreviewModalVisible).toBeFalsy()
        })
    })
})
