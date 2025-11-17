import { assumeMock, renderHook } from '@repo/testing'

import {
    mockBillingState,
    mockCreditCard,
    mockCustomerSummary,
} from '@gorgias/helpdesk-mocks'

import type { ResponseBillingState } from '../useBillingState'
import { useBillingState } from '../useBillingState'
import { useHasCreditCard } from '../useHasCreditCard'

jest.mock('billing/hooks/useBillingState')

const useBillingStateMock = assumeMock(useBillingState)

describe('useHasCreditCard()', () => {
    it('should return true if the user has a credit card', () => {
        useBillingStateMock.mockReturnValue({
            data: mockBillingState({
                customer: mockCustomerSummary({
                    credit_card: mockCreditCard(),
                }),
            }),
            isFetching: false,
        } as unknown as ResponseBillingState)
        const { result } = renderHook(() => useHasCreditCard())
        expect(result.current).toEqual(true)
    })

    it('should return false if the user has no credit card', () => {
        useBillingStateMock.mockReturnValue({
            data: mockBillingState({
                customer: mockCustomerSummary({
                    credit_card: null,
                }),
            }),
            isFetching: false,
        } as unknown as ResponseBillingState)
        const { result } = renderHook(() => useHasCreditCard())
        expect(result.current).toEqual(false)
    })

    it('should return false when the billing state is undefined', async () => {
        useBillingStateMock.mockReturnValue({
            data: undefined,
            isFetching: false,
        } as unknown as ResponseBillingState)

        const { result } = renderHook(() => useHasCreditCard())
        expect(result.current).toEqual(false)
    })
})
