import type { ConvertPlan, Plan } from 'models/billing/types'

export const getNextTier = (
    availablePlans?: Plan[],
    plan?: Plan,
): Plan | undefined => {
    if (!plan || !availablePlans) {
        return undefined
    }

    let nextTierPlan: Plan | undefined = undefined

    for (const availablePlan of availablePlans) {
        if (!availablePlan) {
            continue
        }

        const isSameCadence = availablePlan.cadence === plan.cadence

        const isSameProduct = availablePlan.product === plan.product

        const isBigger =
            availablePlan.num_quota_tickets &&
            plan.num_quota_tickets &&
            availablePlan.num_quota_tickets > plan.num_quota_tickets &&
            availablePlan.amount >= plan.amount

        const isBetter =
            !nextTierPlan || nextTierPlan.amount > availablePlan.amount

        // tier property is only available for convert prices at the moment
        const tier = (plan as ConvertPlan)?.tier

        if (isSameCadence && isSameProduct && isBigger && isBetter && tier) {
            nextTierPlan = availablePlan
        }
    }

    return nextTierPlan
}
