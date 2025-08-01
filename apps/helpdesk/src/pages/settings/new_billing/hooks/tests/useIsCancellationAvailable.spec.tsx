import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import checkIsEnterpriseGMV from '../../utils/checkIsEnterpriseGMV'
import useAutomatedHelpdeskCancellationFlowAvailable from '../useAutomatedHelpdeskCancellationFlowAvailable'
import useIsCancellationAvailable, {
    useIsCancellationAvailableProps,
} from '../useIsCancellationAvailable'

jest.mock('core/flags')
const mockUseFlag = assumeMock(useFlag)
jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)
jest.mock('../useAutomatedHelpdeskCancellationFlowAvailable')
const mockUseAutomatedHelpdeskCancellationFlowAvailable = assumeMock(
    useAutomatedHelpdeskCancellationFlowAvailable,
)
jest.mock('../../utils/checkIsEnterpriseGMV')
const mockUseIsEnterpriseGMV = assumeMock(checkIsEnterpriseGMV)

const mockStore = createStore(() => ({}))
const queryClient = mockQueryClient()

const createWrapper = () => {
    return ({ children }: { children?: React.ReactNode }) => (
        <Provider store={mockStore}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    )
}

const renderIsCancellationAvailable = (
    params: useIsCancellationAvailableProps,
) => {
    return renderHook(() => useIsCancellationAvailable(params), {
        wrapper: createWrapper(),
    })
}

describe('useIsCancellationAvailable', () => {
    const mockCurrentAccount = {
        get: jest.fn(),
    }

    const defaultParams = {
        helpdeskPlan: { plan_id: 'test-plan' },
        editingAvailable: true,
        isTrialing: false,
    } as useIsCancellationAvailableProps

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppSelector.mockReturnValue(mockCurrentAccount)
        mockUseFlag.mockReturnValue(false)
        mockUseAutomatedHelpdeskCancellationFlowAvailable.mockReturnValue(true)
        mockUseIsEnterpriseGMV.mockReturnValue(false)
        mockCurrentAccount.get.mockReturnValue(false)
    })

    afterEach(() => {
        queryClient.removeQueries()
    })

    it('should return true when all conditions are met', () => {
        const { result } = renderIsCancellationAvailable(defaultParams)
        expect(result.current).toBe(true)
    })

    it('should return false when useAutomatedHelpdeskCancellationFlowAvailable returns false', () => {
        mockUseAutomatedHelpdeskCancellationFlowAvailable.mockReturnValue(false)

        const { result } = renderIsCancellationAvailable(defaultParams)
        expect(result.current).toBe(false)
    })

    it('should return false when editingAvailable is false', () => {
        const params = { ...defaultParams, editingAvailable: false }
        const { result } = renderIsCancellationAvailable(params)
        expect(result.current).toBe(false)
    })

    it('should return false when isTrialing is true', () => {
        const params = { ...defaultParams, isTrialing: true }
        const { result } = renderIsCancellationAvailable(params)
        expect(result.current).toBe(false)
    })

    it('should return false when disableAutoRenewalCancellationForEnterpriseGMV feature flag is true and customer is EntepriseGMV', () => {
        mockUseFlag.mockReturnValue(true)
        mockUseIsEnterpriseGMV.mockReturnValue(true)

        const { result } = renderIsCancellationAvailable(defaultParams)
        expect(result.current).toBe(false)
    })
})
