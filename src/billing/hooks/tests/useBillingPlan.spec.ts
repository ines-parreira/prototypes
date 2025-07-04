import { mockBillingState, mockCurrentPlans } from '@gorgias/helpdesk-mocks'

import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useBillingPlan } from '../useBillingPlan'
import { useBillingState } from '../useBillingState'

jest.mock('billing/hooks/useBillingState')

const useBillingStateMock = assumeMock(useBillingState)

describe('useBillingPlan()', () => {
    it('should return the plan for the given name', () => {
        const state = mockBillingState({
            current_plans: mockCurrentPlans(),
        })
        useBillingStateMock.mockReturnValue(state)

        const { result } = renderHook(() => useBillingPlan('helpdesk'))
        expect(result.current).toEqual(state.current_plans.helpdesk)
    })

    it('should return null if that plan is not available', () => {
        const state = mockBillingState({
            current_plans: mockCurrentPlans({
                voice: null,
            }),
        })
        useBillingStateMock.mockReturnValue(state)

        const { result } = renderHook(() => useBillingPlan('voice'))
        expect(result.current).toEqual(null)
    })

    it('should return undefined if an invalid name is provided', () => {
        const plans = mockCurrentPlans()
        useBillingStateMock.mockReturnValue(
            mockBillingState({
                current_plans: plans,
            }),
        )

        // @ts-expect-error - invalid plan name
        const { result } = renderHook(() => useBillingPlan('invalid'))
        expect(result.current).toEqual(undefined)
    })

    it('should return null when the billing state is undefined', async () => {
        useBillingStateMock.mockReturnValue(undefined)

        const { result } = renderHook(() => useBillingPlan('helpdesk'))
        expect(result.current).toEqual(undefined)
    })
})
