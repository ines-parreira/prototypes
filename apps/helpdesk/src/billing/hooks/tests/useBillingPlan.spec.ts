import { renderHook } from '@repo/testing'

import { mockBillingState, mockCurrentPlans } from '@gorgias/helpdesk-mocks'

import { assumeMock } from 'utils/testing'

import { useBillingPlan } from '../useBillingPlan'
import { ResponseBillingState, useBillingState } from '../useBillingState'

jest.mock('billing/hooks/useBillingState')

const useBillingStateMock = assumeMock(useBillingState)

describe('useBillingPlan()', () => {
    it('should return the plan for the given name', () => {
        const billingData = mockBillingState({
            current_plans: mockCurrentPlans(),
        })
        useBillingStateMock.mockReturnValue({
            data: billingData,
            isFetching: false,
        } as unknown as ResponseBillingState)

        const { result } = renderHook(() => useBillingPlan('helpdesk'))
        expect(result.current).toEqual(billingData.current_plans.helpdesk)
    })

    it('should return null if that plan is not available', () => {
        const billingData = mockBillingState({
            current_plans: mockCurrentPlans({
                voice: null,
            }),
        })
        useBillingStateMock.mockReturnValue({
            data: billingData,
            isFetching: false,
        } as unknown as ResponseBillingState)

        const { result } = renderHook(() => useBillingPlan('voice'))
        expect(result.current).toEqual(null)
    })

    it('should return undefined if an invalid name is provided', () => {
        const plans = mockCurrentPlans()
        useBillingStateMock.mockReturnValue({
            data: mockBillingState({
                current_plans: plans,
            }),
            isFetching: false,
        } as unknown as ResponseBillingState)

        // @ts-expect-error - invalid plan name
        const { result } = renderHook(() => useBillingPlan('invalid'))
        expect(result.current).toEqual(undefined)
    })

    it('should return null when the billing state is undefined', async () => {
        useBillingStateMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as unknown as ResponseBillingState)

        const { result } = renderHook(() => useBillingPlan('helpdesk'))
        expect(result.current).toEqual(undefined)
    })
})
