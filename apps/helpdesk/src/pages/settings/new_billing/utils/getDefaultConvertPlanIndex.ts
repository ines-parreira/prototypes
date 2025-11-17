import type { Cadence, ConvertPlan } from 'models/billing/types'

const convertPlansMapping: Record<string, string> = {
    Starter: 'convert-01',
    Basic: 'convert-01',
    Pro: 'convert-01',
    Advanced: 'convert-02',
    Custom: 'convert-03',
}

export const getDefaultConvertPlanIndex = (
    cadence?: Cadence,
    convertAvailablePlans?: ConvertPlan[],
    helpdeskPlanName?: string,
): number => {
    let convertInitialIndex =
        convertAvailablePlans?.findIndex(
            (plan) => !!plan.amount && plan.cadence === cadence,
        ) ?? 0

    if (helpdeskPlanName && !!convertPlansMapping[helpdeskPlanName]) {
        const mappedIndex = convertAvailablePlans?.findIndex(
            (plan) =>
                plan.cadence === cadence &&
                plan.plan_id.startsWith(convertPlansMapping[helpdeskPlanName]),
        )
        convertInitialIndex = mappedIndex ?? convertInitialIndex
    }

    return convertInitialIndex
}
