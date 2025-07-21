import { mockBillingState, mockCurrentPlans } from '@gorgias/helpdesk-mocks'

import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { ResponseBillingState, useBillingState } from '../useBillingState'
import { useHasBillingPlan } from '../useHasBillingPlan'

jest.mock('billing/hooks/useBillingState')

const useBillingStateMock = assumeMock(useBillingState)

describe('useHasBillingPlan()', () => {
    it('should return true if the user has a billing plan', () => {
        const billingData = mockBillingState({
            current_plans: mockCurrentPlans(),
        })
        useBillingStateMock.mockReturnValue({
            data: billingData,
            isFetching: false,
        } as unknown as ResponseBillingState)

        const { result } = renderHook(() => useHasBillingPlan('helpdesk'))
        expect(result.current).toEqual(true)
    })

    it('should return false if the user has no billing plan', () => {
        const billingData = mockBillingState({
            current_plans: mockCurrentPlans({
                voice: null,
            }),
        })
        useBillingStateMock.mockReturnValue({
            data: billingData,
            isFetching: false,
        } as unknown as ResponseBillingState)

        const { result } = renderHook(() => useHasBillingPlan('voice'))
        expect(result.current).toEqual(false)
    })

    it('should return undefined when the billing state is undefined', async () => {
        useBillingStateMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as unknown as ResponseBillingState)

        const { result } = renderHook(() => useHasBillingPlan('helpdesk'))
        expect(result.current).toEqual(false)
    })
})
