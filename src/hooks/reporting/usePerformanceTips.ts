import {useMemo} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {MetricName} from 'services/reporting/constants'
import {getPerformanceTip, Tip} from 'services/supportPerformanceTipService'
import {getCurrentHelpdeskProduct} from 'state/billing/selectors'
import {convertLegacyPlanNameToPublicPlanName} from 'utils/paywalls'

export const usePerformanceTips = (
    metric: MetricName,
    value: number | null
): Tip | null => {
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskProduct)
    const currentPlanName = currentHelpdeskPlan
        ? convertLegacyPlanNameToPublicPlanName(currentHelpdeskPlan.name)
        : null
    return useMemo(
        () => getPerformanceTip(metric, value, currentPlanName),
        [currentPlanName, metric, value]
    )
}
