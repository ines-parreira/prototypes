import { useAsyncFn, useEffectOnce } from '@repo/hooks'

import { fetchSubscription } from 'models/billing/resources'
import type { PlanId } from 'models/billing/types'

export default function useProductCancellations() {
    const [state, doFetch] = useAsyncFn(async () => {
        const sub = await fetchSubscription()

        // Map plan_id -> cancellation_date for products scheduled to be cancelled
        const cancellationsByPlanId = new Map<PlanId, string>()

        ;(sub.downgrades || []).forEach((downgrade) => {
            // Only care about cancellations: when scheduled_plan is null
            if (downgrade.scheduled_plan === null) {
                cancellationsByPlanId.set(
                    downgrade.current_plan_id,
                    sub.current_billing_cycle_end_datetime,
                )
            }
        })

        return cancellationsByPlanId
    }, [])

    useEffectOnce(() => {
        void doFetch()
    })

    return state
}
