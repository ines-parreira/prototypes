import { useMemo } from 'react'

import { convertLegacyPlanNameToPublicPlanName } from '@repo/billing'

import type { MetricName } from 'domains/reporting/services/constants'
import type { Tip } from 'domains/reporting/services/supportPerformanceTipService'
import { getPerformanceTip } from 'domains/reporting/services/supportPerformanceTipService'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'

export const usePerformanceTips = (
    metric: MetricName,
    value: number | null,
): Tip | null => {
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const currentPlanName = currentHelpdeskPlan
        ? convertLegacyPlanNameToPublicPlanName(currentHelpdeskPlan.name)
        : null
    return useMemo(
        () => getPerformanceTip(metric, value, currentPlanName),
        [currentPlanName, metric, value],
    )
}
