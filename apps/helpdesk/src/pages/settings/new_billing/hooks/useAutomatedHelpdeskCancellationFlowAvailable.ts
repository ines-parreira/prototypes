import type { HelpdeskPlan } from 'models/billing/types'
import { isStarterTier } from 'models/billing/utils'

const useAutomatedHelpdeskCancellationFlowAvailable = (
    helpdeskPlan: HelpdeskPlan | null,
) => {
    if (!helpdeskPlan) {
        return false
    }

    const isProTierPlan = helpdeskPlan.plan_id.includes('pro')
    const isBasicTierPlan = helpdeskPlan.plan_id.includes('basic')
    const isStarterTierPlan = isStarterTier(helpdeskPlan)

    return isProTierPlan || isBasicTierPlan || isStarterTierPlan
}

export default useAutomatedHelpdeskCancellationFlowAvailable
