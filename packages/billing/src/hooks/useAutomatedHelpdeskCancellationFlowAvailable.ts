import type { HelpdeskPlan } from '../types'
import { isStarterTier } from '../utils/isStarterTier'

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
