import {AccountFeature} from '../state/currentAccount/types'
import {Plan, PlanInterval} from '../models/billing/types'

export const getCheapestPlanForFeature = (
    featureName: AccountFeature,
    plans: Record<string, Plan>
): string =>
    Object.values(plans)
        .filter((plan) => plan.interval === PlanInterval.Month)
        .sort((planA, planB) => planA.amount - planB.amount)
        .find((plan) => {
            const feature = plan.features[featureName]
            return typeof feature === 'boolean' ? feature : feature.enabled
        })!.name
