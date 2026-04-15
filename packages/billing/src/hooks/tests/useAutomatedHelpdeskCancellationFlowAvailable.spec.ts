import { renderHook } from '@repo/testing'

import {
    basicMonthlyHelpdeskPlan,
    proMonthlyHelpdeskPlan,
} from '../../fixtures.data'
import type { HelpdeskPlan } from '../../types'
import { Cadence, HelpdeskPlanTier, ProductType } from '../../types'
import useAutomatedHelpdeskCancellationFlowAvailable from '../useAutomatedHelpdeskCancellationFlowAvailable'

const starterHelpdeskPlan: HelpdeskPlan = {
    ...basicMonthlyHelpdeskPlan,
    plan_id: 'starter-monthly-usd-5',
    name: 'Starter',
    tier: HelpdeskPlanTier.STARTER,
}

const advancedMonthlyHelpdeskPlan: HelpdeskPlan = {
    ...proMonthlyHelpdeskPlan,
    plan_id: 'advanced-monthly-usd-5',
    name: 'Advanced',
    tier: HelpdeskPlanTier.ADVANCED,
}

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
