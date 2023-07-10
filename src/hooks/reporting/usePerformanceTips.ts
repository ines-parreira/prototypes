import useAppSelector from 'hooks/useAppSelector'
import {Tip, getPerformanceTip} from 'services/performanceTipService'
import {MetricName} from 'services/reporting/constants'
import {getCurrentHelpdeskProduct} from 'state/billing/selectors'
import {convertLegacyPlanNameToPublicPlanName} from 'utils/paywalls'

export const usePerformanceTips = (
    metric: MetricName,
    value: number | null
): Tip => {
    const helpdeskPrice = useAppSelector(getCurrentHelpdeskProduct)
    const currentPlanName = helpdeskPrice
        ? convertLegacyPlanNameToPublicPlanName(helpdeskPrice.name)
        : null

    return getPerformanceTip(metric, value, currentPlanName)
}
