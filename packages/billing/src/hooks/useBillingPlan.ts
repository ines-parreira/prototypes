import type { BasePlan } from '@gorgias/helpdesk-queries'

import type { BillingPlanName } from '../types'
import { useBillingPlans } from './useBillingPlans'

export function useBillingPlan(
    planName: BillingPlanName,
): BasePlan | null | undefined {
    const plans = useBillingPlans()
    return plans?.[planName]
}
