import { useMemo } from 'react'

import type { ScheduledChangesByProduct } from '@repo/billing'
import { ProductType, useBillingState } from '@repo/billing'

const PRODUCT_TO_PLAN_KEY = {
    [ProductType.Helpdesk]: 'helpdesk',
    [ProductType.Automation]: 'automate',
    [ProductType.Voice]: 'voice',
    [ProductType.SMS]: 'sms',
    [ProductType.Convert]: 'convert',
} as const

export function useScheduledChangesSummary() {
    const { data } = useBillingState()

    return useMemo(() => {
        const sub = data?.subscription
        const currentPlans = data?.current_plans
        if (!sub || !currentPlans) {
            return {}
        }

        const changes: ScheduledChangesByProduct = {}
        for (const change of sub.scheduled_changes ?? []) {
            if (!change.current_plan_id) continue

            const isCancellation =
                change.scheduled_change_types.includes('UNSUBSCRIPTION')
            if (isCancellation) continue

            const productType = Object.values(ProductType).find(
                (pt) =>
                    currentPlans[PRODUCT_TO_PLAN_KEY[pt]]?.plan_id ===
                    change.current_plan_id,
            )

            if (productType) {
                // Ramp-based changes always apply at the billing cycle boundary
                changes[productType] = {
                    date: sub.current_billing_cycle_end_datetime,
                    targetPlan: change.scheduled_plan,
                }
            }
        }
        return changes
    }, [data?.subscription, data?.current_plans])
}
