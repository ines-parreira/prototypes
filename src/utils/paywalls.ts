import {AccountFeatures} from '../state/currentAccount/types'
import {Plan} from '../models/billing/types'

export const getCheaperPlanForFeature = (
    feature: typeof AccountFeatures[keyof typeof AccountFeatures],
    plans: Record<string, Plan>
) => {
    return Object.values(plans)
        .filter((plan) => plan.interval === 'month')
        .sort((planA, planB) => planA.amount - planB.amount)
        .find((plan) => plan.features[feature])!.name
}
