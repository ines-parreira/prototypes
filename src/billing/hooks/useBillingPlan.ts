import { BasePlan } from '@gorgias/helpdesk-queries'

import { BillingPlanName, useBillingPlans } from 'billing'

export function useBillingPlan(
    planName: BillingPlanName,
): BasePlan | null | undefined {
    const plans = useBillingPlans()
    return plans?.[planName]
}
