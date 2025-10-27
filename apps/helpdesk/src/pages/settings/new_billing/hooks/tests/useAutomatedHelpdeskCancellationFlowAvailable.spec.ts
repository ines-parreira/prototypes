import { renderHook } from '@repo/testing'

import {
    advancedMonthlyHelpdeskPlan,
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
    starterHelpdeskPlan,
} from 'fixtures/productPrices'

import useAutomatedHelpdeskCancellationFlowAvailable from '../useAutomatedHelpdeskCancellationFlowAvailable'

describe('useAutomatedHelpdeskCancellationFlowAvailable', () => {
    it('returns false if helpdeskProduct is null', () => {
        const { result } = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(null),
        )
        expect(result.current).toBe(false)
    })

    it('returns true for pro tier plan', () => {
        const { result } = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(
                proMonthlyHelpdeskPlan,
            ),
        )

        expect(result.current).toBe(true)
    })

    it('returns true for basic tier plan', () => {
        const { result } = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(
                basicMonthlyHelpdeskPlan,
            ),
        )

        expect(result.current).toBe(true)
    })

    it('returns true for starter tier plan', () => {
        const { result } = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(starterHelpdeskPlan),
        )

        expect(result.current).toBe(true)
    })

    it('returns false for unsupported tier plan', () => {
        const { result } = renderHook(() =>
            useAutomatedHelpdeskCancellationFlowAvailable(
                advancedMonthlyHelpdeskPlan,
            ),
        )

        expect(result.current).toBe(false)
    })
})
