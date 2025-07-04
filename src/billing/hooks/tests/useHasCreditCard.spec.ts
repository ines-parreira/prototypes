import {
    mockBillingState,
    mockCreditCard,
    mockCustomerSummary,
} from '@gorgias/helpdesk-mocks'

import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

import { useBillingState } from '../useBillingState'
import { useHasCreditCard } from '../useHasCreditCard'

jest.mock('billing/hooks/useBillingState')

const useBillingStateMock = assumeMock(useBillingState)

describe('useHasCreditCard()', () => {
    it('should return true if the user has a credit card', () => {
        useBillingStateMock.mockReturnValue(
            mockBillingState({
                customer: mockCustomerSummary({
                    credit_card: mockCreditCard(),
                }),
            }),
        )
        const { result } = renderHook(() => useHasCreditCard())
        expect(result.current).toEqual(true)
    })

    it('should return false if the user has no credit card', () => {
        useBillingStateMock.mockReturnValue(
            mockBillingState({
                customer: mockCustomerSummary({
                    credit_card: null,
                }),
            }),
        )
        const { result } = renderHook(() => useHasCreditCard())
        expect(result.current).toEqual(false)
    })

    it('should return false when the billing state is undefined', async () => {
        useBillingStateMock.mockReturnValue(undefined)

        const { result } = renderHook(() => useHasCreditCard())
        expect(result.current).toEqual(false)
    })
})
