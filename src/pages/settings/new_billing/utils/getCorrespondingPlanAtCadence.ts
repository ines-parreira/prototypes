import { Cadence, Plan } from 'models/billing/types'

export type Props<T extends Plan> = {
    availablePlans: T[]
    currentPlan?: T
    cadence: Cadence
}

export const getCorrespondingPlanAtCadence = <T extends Plan>({
    availablePlans,
    currentPlan,
    cadence,
}: Props<T>): T | undefined => {
    const switchInterval =
        cadence === Cadence.Month
            ? { to: 'monthly', from: 'yearly' }
            : { to: 'yearly', from: 'monthly' }

    const targetPlanId = currentPlan?.plan_id.replace(
        switchInterval.from,
        switchInterval.to,
    )

    const plan = availablePlans.find((plan) => plan.plan_id === targetPlanId)

    if (!plan) {
        return currentPlan
    }

    return plan
}
