import type { CurrentPlans } from '@gorgias/helpdesk-queries'

import type { BillingPlanName } from '../types'
import { useBillingPlans } from './useBillingPlans'

export function useBillingPlan(
    planName: BillingPlanName,
): CurrentPlans[BillingPlanName] | undefined {
    const plans = useBillingPlans()
    return plans?.[planName]
}
