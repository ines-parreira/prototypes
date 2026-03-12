import { useMemo } from 'react'

import type {
    AutomatePlan,
    ConvertPlan,
    PlanId,
    SMSOrVoicePlan,
} from 'models/billing/types'
import { ProductType } from 'models/billing/types'

import useProductCancellations from '../../../hooks/useProductCancellations'

type CancellablePlan = AutomatePlan | SMSOrVoicePlan | ConvertPlan

function getCancellationDate(
    cancellationsByPlanId: Map<PlanId, string>,
    plan?: CancellablePlan,
): string | null {
    return plan ? cancellationsByPlanId.get(plan.plan_id) || null : null
}

type UseCancellationSummaryParams = {
    currentAutomatePlan?: AutomatePlan
    currentVoicePlan?: SMSOrVoicePlan
    currentSmsPlan?: SMSOrVoicePlan
    currentConvertPlan?: ConvertPlan
}

type CancellationDates = Partial<Record<ProductType, string | null>>

export function useCancellationSummary({
    currentAutomatePlan,
    currentVoicePlan,
    currentSmsPlan,
    currentConvertPlan,
}: UseCancellationSummaryParams) {
    const { data: cancellationsByPlanId } = useProductCancellations()

    const { totalCancelledAmount, cancelledProducts, cancellationDates } =
        useMemo(() => {
            const map = cancellationsByPlanId ?? new Map<PlanId, string>()
            const plans = [
                { plan: currentAutomatePlan, type: ProductType.Automation },
                { plan: currentVoicePlan, type: ProductType.Voice },
                { plan: currentSmsPlan, type: ProductType.SMS },
                { plan: currentConvertPlan, type: ProductType.Convert },
            ] as const

            let total = 0
            const cancelled: ProductType[] = []
            const dates: CancellationDates = {}

            for (const { plan, type } of plans) {
                const date = getCancellationDate(map, plan)
                dates[type] = date
                if (date) {
                    total += plan?.amount ?? 0
                    cancelled.push(type)
                }
            }

            return {
                totalCancelledAmount: total,
                cancelledProducts: cancelled,
                cancellationDates: dates,
            }
        }, [
            cancellationsByPlanId,
            currentAutomatePlan,
            currentVoicePlan,
            currentSmsPlan,
            currentConvertPlan,
        ])

    return {
        cancellationDates,
        totalCancelledAmount,
        cancelledProducts,
    }
}
