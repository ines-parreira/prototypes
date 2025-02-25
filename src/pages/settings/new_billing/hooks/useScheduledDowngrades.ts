import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import useEffectOnce from 'hooks/useEffectOnce'
import { fetchSubscription } from 'models/billing/resources'
import { Plan } from 'models/billing/types'
import { getAvailablePlansMap } from 'state/billing/selectors'

interface ScheduledDowngrade {
    datetime: string
    currentPlan: Plan
    targetPlan: Plan | null
}

export default function useScheduledDowngrades() {
    const plansMap = useAppSelector(getAvailablePlansMap)

    const [state, doFetch] = useAsyncFn(async () => {
        const sub = await fetchSubscription()

        const downgrades: ScheduledDowngrade[] = (sub.downgrades || [])
            .filter((downgrade) => {
                const currentPlan = plansMap[downgrade.current_price_id]
                return !!currentPlan
            })
            .map((downgrade) => {
                const currentPlan = plansMap[downgrade.current_price_id]
                return {
                    datetime: sub.current_billing_cycle_end_datetime,
                    currentPlan: currentPlan,
                    targetPlan: downgrade.scheduled_price_id
                        ? plansMap[downgrade.scheduled_price_id]
                        : null,
                }
            })

        return downgrades
    }, [plansMap])

    useEffectOnce(() => {
        void doFetch()
    })

    return state
}
