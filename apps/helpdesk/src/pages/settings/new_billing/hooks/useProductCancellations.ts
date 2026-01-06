import { useMemo } from 'react'

import { useSubscription } from 'models/billing/queries'
import type { PlanId } from 'models/billing/types'

export default function useProductCancellations() {
    const subscriptionQuery = useSubscription()

    const cancellationsByPlanId = useMemo(() => {
        if (!subscriptionQuery.data) {
            return new Map<PlanId, string>()
        }

        const sub = subscriptionQuery.data
        const map = new Map<PlanId, string>()

        // Map plan_id -> cancellation_date for products scheduled to be cancelled
        ;(sub.downgrades || []).forEach((downgrade) => {
            // Only care about cancellations: when scheduled_plan is null
            if (downgrade.scheduled_plan === null) {
                map.set(
                    downgrade.current_plan_id,
                    sub.current_billing_cycle_end_datetime,
                )
            }
        })

        return map
    }, [subscriptionQuery.data])

    return {
        ...subscriptionQuery,
        data: cancellationsByPlanId,
    }
}
