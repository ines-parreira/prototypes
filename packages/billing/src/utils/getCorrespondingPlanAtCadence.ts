import { Cadence } from '../types'
import type { Plan } from '../types'

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
    if (!currentPlan || currentPlan.cadence === cadence) {
        return currentPlan
    }

    const targetPlanId = currentPlan.plan_id.replace(
        getCadenceName(currentPlan.cadence).toLowerCase(),
        getCadenceName(cadence).toLowerCase(),
    )
    const canUseIDCheck = currentPlan.plan_id !== targetPlanId

    const plan = availablePlans.find(
        (plan) => canUseIDCheck && plan.plan_id === targetPlanId,
    )

    return plan
}

function getCadenceName(cadence: Cadence): string {
    switch (cadence) {
        case Cadence.Month:
            return 'Monthly'
        case Cadence.Quarter:
            return 'Quarterly'
        case Cadence.Year:
            return 'Yearly'
        default:
            const __: never = cadence
            throw new Error(`Unsupported cadence: ${__}`)
    }
}
