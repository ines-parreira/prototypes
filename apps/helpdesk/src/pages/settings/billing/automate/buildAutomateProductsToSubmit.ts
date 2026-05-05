import type { Plan } from 'models/billing/types'
import { ProductType } from 'models/billing/types'
import type { ProductToPlanId } from 'state/billing/types'

type CurrentPlansByProduct = Partial<Record<ProductType, Plan | undefined>>

export function buildAutomateProductsToSubmit(
    selectedAutomatePlan: Plan | undefined,
    currentPlansByProduct: CurrentPlansByProduct | undefined,
): ProductToPlanId {
    return Object.values(ProductType).reduce<ProductToPlanId>((acc, type) => {
        const plan =
            type === ProductType.Automation
                ? selectedAutomatePlan
                : currentPlansByProduct?.[type]
        if (plan?.plan_id) {
            acc[type] = plan.plan_id
        }
        return acc
    }, {})
}
