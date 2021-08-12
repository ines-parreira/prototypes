import {AccountFeature} from '../state/currentAccount/types'
import {Plan, PlanInterval} from '../models/billing/types'

import {isFeatureEnabled} from './account'

export const getCheapestPlanNameForFeature = (
    featureName: AccountFeature,
    plans: Record<string, Plan>
): string | null => {
    const plan = Object.values(plans)
        .filter((plan) => plan.interval === PlanInterval.Month)
        .sort((planA, planB) => planA.amount - planB.amount)
        .find(
            (plan) =>
                plan.features[featureName] &&
                isFeatureEnabled(plan.features[featureName])
        )
    return plan ? plan.name : null
}
