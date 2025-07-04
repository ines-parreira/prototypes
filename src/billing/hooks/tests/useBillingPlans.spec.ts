import { mockBillingState, mockCurrentPlans } from '@gorgias/helpdesk-mocks'

import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useBillingPlans } from '../useBillingPlans'
import { useBillingState } from '../useBillingState'

jest.mock('billing/hooks/useBillingState')

const useBillingStateMock = assumeMock(useBillingState)

describe('useBillingPlans()', () => {
    it('should return the current plans', async () => {
        const state = mockBillingState({
            current_plans: mockCurrentPlans(),
        })
        useBillingStateMock.mockReturnValue(state)

        const { result } = renderHook(() => useBillingPlans())
        expect(result.current).toEqual(state.current_plans)
    })

    it('should return undefined when the billing state is undefined', async () => {
        useBillingStateMock.mockReturnValue(undefined)

        const { result } = renderHook(() => useBillingPlans())
        expect(result.current).toEqual(undefined)
    })
})
