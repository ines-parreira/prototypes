import { useAsyncFn, useEffectOnce } from '@repo/hooks'

import useAppSelector from 'hooks/useAppSelector'
import { fetchSubscription } from 'models/billing/resources'
import type { Plan, SubscriptionCycle } from 'models/billing/types'
import { getAvailablePlansMapByPlanId } from 'state/billing/selectors'

interface ScheduledDowngrade {
    datetime: string
    currentPlan: Plan
    targetPlan: Plan | null
}

export default function useScheduledDowngrades() {
    const plansMap = useAppSelector(getAvailablePlansMapByPlanId)

    const [state, doFetch] = useAsyncFn(async () => {
        const sub: SubscriptionCycle = await fetchSubscription()

        const downgrades: ScheduledDowngrade[] = (sub.downgrades || [])
            .filter((downgrade) => {
                const currentPlan = plansMap[downgrade.current_plan_id]
                return !!currentPlan
            })
            .map((downgrade) => {
                const currentPlan = plansMap[downgrade.current_plan_id]
                return {
                    datetime: sub.current_billing_cycle_end_datetime,
                    currentPlan: currentPlan,
                    targetPlan: downgrade.scheduled_plan,
                }
            })

        return downgrades
    }, [plansMap])

    useEffectOnce(() => {
        void doFetch()
    })

    return state
}
