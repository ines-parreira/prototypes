import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { useSubscription } from 'models/billing/queries'
import type { Plan } from 'models/billing/types'
import { getAvailablePlansMapByPlanId } from 'state/billing/selectors'

interface ScheduledDowngrade {
    datetime: string
    currentPlan: Plan
    targetPlan: Plan | null
}

export default function useScheduledDowngrades() {
    const plansMap = useAppSelector(getAvailablePlansMapByPlanId)
    const { data: sub, isLoading, error } = useSubscription()

    const downgrades = useMemo(() => {
        if (!sub) return null

        const result: ScheduledDowngrade[] = (sub.downgrades || [])
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

        return result
    }, [sub, plansMap])

    return {
        value: downgrades,
        loading: isLoading,
        error: error || undefined,
    }
}
