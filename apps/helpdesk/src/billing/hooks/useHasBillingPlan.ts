import { BillingPlanName, useBillingPlan } from 'billing'

export function useHasBillingPlan(planName: BillingPlanName): boolean {
    const plan = useBillingPlan(planName)
    return !!plan
}
