import { renderHook } from '@repo/testing'

import { mockBillingState, mockCurrentPlans } from '@gorgias/helpdesk-mocks'

import { assumeMock } from 'utils/testing'

import { useBillingPlans } from '../useBillingPlans'
import { ResponseBillingState, useBillingState } from '../useBillingState'

jest.mock('billing/hooks/useBillingState')

const useBillingStateMock = assumeMock(useBillingState)

describe('useBillingPlans()', () => {
    it('should return the current plans', async () => {
        const billingData = mockBillingState({
            current_plans: mockCurrentPlans(),
        })
        useBillingStateMock.mockReturnValue({
            data: billingData,
            isFetching: false,
        } as unknown as ResponseBillingState)

        const { result } = renderHook(() => useBillingPlans())
        expect(result.current).toEqual(billingData.current_plans)
    })

    it('should return undefined when the billing state is undefined', async () => {
        useBillingStateMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as unknown as ResponseBillingState)

        const { result } = renderHook(() => useBillingPlans())
        expect(result.current).toEqual(undefined)
    })
})
