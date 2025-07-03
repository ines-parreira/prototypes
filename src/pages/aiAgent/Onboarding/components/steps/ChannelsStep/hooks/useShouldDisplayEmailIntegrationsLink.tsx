import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { HelpdeskPlanTier } from 'models/billing/types'
import { isEnterprise } from 'models/billing/utils'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'

export const useShouldDisplayEmailIntegrationsLink = () => {
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)

    return useMemo(() => {
        if (!currentHelpdeskPlan) {
            return false
        }

        if (isEnterprise(currentHelpdeskPlan)) {
            return false
        }

        if (currentHelpdeskPlan.tier === HelpdeskPlanTier.ADVANCED) {
            return false
        }

        return true
    }, [currentHelpdeskPlan])
}
