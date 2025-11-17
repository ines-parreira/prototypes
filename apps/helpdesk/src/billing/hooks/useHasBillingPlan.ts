import type { BillingPlanName } from 'billing'
import { useBillingPlan } from 'billing'

export function useHasBillingPlan(planName: BillingPlanName): boolean {
    const plan = useBillingPlan(planName)
    return !!plan
}
