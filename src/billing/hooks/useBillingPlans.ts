import { CurrentPlans } from '@gorgias/helpdesk-queries'

import { useBillingState } from './useBillingState'

export function useBillingPlans(): CurrentPlans | undefined {
    const state = useBillingState()
    return state.data?.current_plans
}
