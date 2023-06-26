import useAppSelector from 'hooks/useAppSelector'
import {
    MetricName,
    Tip,
    getPerformanceTip,
} from 'services/performanceTipService'
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
