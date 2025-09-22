import { Cadence, Plan } from 'models/billing/types'
import { getCadenceName } from 'models/billing/utils'

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
    // If the current plan is null or already has the desired cadence, return it
    if (!currentPlan || currentPlan?.cadence === cadence) {
        return currentPlan
    }

    const targetPlanId = currentPlan?.plan_id.replace(
        getCadenceName(currentPlan.cadence).toLowerCase(),
        getCadenceName(cadence).toLowerCase(),
    )

    const plan = availablePlans.find(
        (plan) =>
            plan.plan_id === targetPlanId ||
            (plan.cadence === cadence &&
                plan.product === currentPlan.product &&
                plan.name === currentPlan.name &&
                plan.generation === currentPlan.generation),
    )

    if (!plan) {
        throw new Error('Plan not found at this cadence')
    }

    return plan
}
