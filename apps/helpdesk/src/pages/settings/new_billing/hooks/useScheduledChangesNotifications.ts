import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import useAppSelector from 'hooks/useAppSelector'
import { useSubscription } from 'models/billing/queries'
import type { Plan, ScheduledChange } from 'models/billing/types'
import { getAvailablePlansMapByPlanId } from 'state/billing/selectors'

export type ScheduledBillingUpdate = {
    datetime: string
    currentPlan: Plan
    targetPlan: Plan | null
    typeOfChange?: 'UPGRADE' | 'DOWNGRADE'
}

export default function useScheduledChangesNotifications() {
    const shouldUseUpdates = useFlag(FeatureFlagKey.ShowBillingRamps)

    const plansMap = useAppSelector(getAvailablePlansMapByPlanId)
    const { data: sub, isLoading, error } = useSubscription()

    const scheduledUpdates = useMemo(() => {
        const result: ScheduledBillingUpdate[] = []

        sub?.has_schedule &&
            sub.scheduled_changes?.forEach((change: ScheduledChange) => {
                const currentPlan = plansMap[change.current_plan_id]
                if (change.scheduled_change_types.length) {
                    result.push({
                        datetime: sub.current_billing_cycle_end_datetime,
                        currentPlan,
                        targetPlan: change.scheduled_plan,
                        typeOfChange: change.scheduled_change_types[0],
                    })
                }
            })

        return result
    }, [sub, plansMap])

    const downgrades = useMemo(() => {
        if (!sub) return null

        return (sub.downgrades || [])
            .filter((downgrade) => !!plansMap[downgrade.current_plan_id])
            .map((downgrade) => ({
                datetime: sub.current_billing_cycle_end_datetime,
                currentPlan: plansMap[downgrade.current_plan_id],
                targetPlan: downgrade.scheduled_plan,
            }))
    }, [sub, plansMap])

    return {
        scheduledUpdates: shouldUseUpdates ? scheduledUpdates : downgrades,
        loading: isLoading,
        error: error || null,
    }
}
