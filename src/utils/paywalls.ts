import {AccountFeature} from '../state/currentAccount/types'
import {Plan, PlanInterval} from '../models/billing/types'

export const getCheapestPlanNameForFeature = (
    featureName: AccountFeature,
    plans: Record<string, Plan>
): string | null => {
    const plan = Object.values(plans)
        .filter((plan) => plan.interval === PlanInterval.Month)
        .sort((planA, planB) => planA.amount - planB.amount)
        .find((plan) => {
            const feature = plan.features[featureName]
            return typeof feature === 'boolean' ? feature : feature.enabled
        })
    return plan ? plan.name : null
}
