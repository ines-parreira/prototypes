import type { BasePlan } from '@gorgias/helpdesk-queries'

import type { BillingPlanName } from 'billing'
import { useBillingPlans } from 'billing'

export function useBillingPlan(
    planName: BillingPlanName,
): BasePlan | null | undefined {
    const plans = useBillingPlans()
    return plans?.[planName]
}
