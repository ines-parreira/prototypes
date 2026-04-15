import type { BillingPlanName } from '../types'
import { useBillingPlan } from './useBillingPlan'

export function useHasBillingPlan(planName: BillingPlanName): boolean {
    const plan = useBillingPlan(planName)
    return !!plan
}
