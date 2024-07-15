import {Plan, PlanInterval} from 'models/billing/types'

export type Props<T extends Plan> = {
    availablePlans: T[]
    currentPlan?: T
    interval: PlanInterval
}

export const getCorrespondingPlanAtInterval = <T extends Plan>({
    availablePlans,
    currentPlan,
    interval,
}: Props<T>): T | undefined => {
    const switchInterval =
        interval === PlanInterval.Month
            ? {to: 'monthly', from: 'yearly'}
            : {to: 'yearly', from: 'monthly'}

    const internalId = currentPlan?.internal_id.replace(
        switchInterval.from,
        switchInterval.to
    )

    const plan = availablePlans.find((plan) => plan.internal_id === internalId)

    if (!plan) {
        return currentPlan
    }

    return plan
}
