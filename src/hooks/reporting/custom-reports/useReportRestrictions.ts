import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { getComponentConfig } from 'pages/stats/custom-reports/config'
import { STATS_ROUTES } from 'routes/constants'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

export type RestrictionsMap = Record<string, boolean | undefined>

export const useReportRestrictions = () => {
    const isNewSatisfactionReportEnabled =
        useFlags()[FeatureFlagKey.NewSatisfactionReport]
    const isHelpCenterAnalyticsEnabled =
        useFlags()[FeatureFlagKey.HelpCenterAnalytics]
    const user = useAppSelector(getCurrentUser)
    const hasAutomate = useAppSelector(getHasAutomate)
    const isTeamLeadOrAdmin = isTeamLead(user)
    const isAutoQANavLinkAvailable = useMemo(
        () => isTeamLeadOrAdmin && hasAutomate,
        [hasAutomate, isTeamLeadOrAdmin],
    )
    const restrictionsMap: RestrictionsMap = useMemo(
        () => ({
            [STATS_ROUTES.SUPPORT_PERFORMANCE_HELP_CENTER]:
                !isHelpCenterAnalyticsEnabled,
            [STATS_ROUTES.QUALITY_MANAGEMENT_SATISFACTION]:
                !isNewSatisfactionReportEnabled,
            [STATS_ROUTES.QUALITY_MANAGEMENT_AUTO_QA]:
                !isAutoQANavLinkAvailable,
        }),
        [
            isAutoQANavLinkAvailable,
            isHelpCenterAnalyticsEnabled,
            isNewSatisfactionReportEnabled,
        ],
    )
    return {
        restrictionsMap,
    }
}

export const isChartRestricted = (
    restrictionsMap: RestrictionsMap,
    chartId: string,
) => {
    const { reportConfig } = getComponentConfig(chartId)
    if (!reportConfig) return false
    return !!restrictionsMap[reportConfig.reportPath]
}

export const useIsChartRestricted = (chartId: string) => {
    const { restrictionsMap } = useReportRestrictions()
    return isChartRestricted(restrictionsMap, chartId)
}
