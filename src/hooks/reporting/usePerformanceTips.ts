import {useMemo} from 'react'
import useAppSelector from 'hooks/useAppSelector'
import {MetricName} from 'services/reporting/constants'
import {getPerformanceTip, Tip} from 'services/supportPerformanceTipService'
import {getCurrentHelpdeskProduct} from 'state/billing/selectors'
import {convertLegacyPlanNameToPublicPlanName} from 'utils/paywalls'
import {useIsAutomateRebranding} from 'pages/automate/common/hooks/useIsAutomateRebranding'

export const usePerformanceTips = (
    metric: MetricName,
    value: number | null
): Tip | null => {
    const helpdeskPrice = useAppSelector(getCurrentHelpdeskProduct)
    const currentPlanName = helpdeskPrice
        ? convertLegacyPlanNameToPublicPlanName(helpdeskPrice.name)
        : null
    const {baseUrl: macrosAndRulesBaseUrl} = useIsAutomateRebranding()
    return useMemo(
        () =>
            getPerformanceTip(
                metric,
                value,
                currentPlanName,
                macrosAndRulesBaseUrl
            ),
        [currentPlanName, metric, value, macrosAndRulesBaseUrl]
    )
}
