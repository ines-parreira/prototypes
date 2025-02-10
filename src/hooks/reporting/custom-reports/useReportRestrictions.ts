import {useFlags} from 'launchdarkly-react-client-sdk'

import {useMemo} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'

import {getComponentConfig} from 'pages/stats/custom-reports/config'
import {HELP_CENTER_REPORT_PAGE_SLUG} from 'pages/stats/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import {SATISFACTION_REPORT_PAGE_SLUG} from 'pages/stats/quality-management/satisfaction/SatisfactionReportConfig'
import {AUTO_QA_REPORT_PAGE_SLUG} from 'pages/stats/support-performance/auto-qa/AutoQAReportConfig'

import {getHasAutomate} from 'state/billing/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {isTeamLead} from 'utils'

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
        [hasAutomate, isTeamLeadOrAdmin]
    )
    const restrictionsMap: RestrictionsMap = useMemo(
        () => ({
            [HELP_CENTER_REPORT_PAGE_SLUG]: !isHelpCenterAnalyticsEnabled,
            [SATISFACTION_REPORT_PAGE_SLUG]: !isNewSatisfactionReportEnabled,
            [AUTO_QA_REPORT_PAGE_SLUG]: !isAutoQANavLinkAvailable,
        }),
        [
            isAutoQANavLinkAvailable,
            isHelpCenterAnalyticsEnabled,
            isNewSatisfactionReportEnabled,
        ]
    )
    return {
        restrictionsMap,
    }
}

export const isChartRestricted = (
    restrictionsMap: RestrictionsMap,
    chartId: string
) => {
    const {reportConfig} = getComponentConfig(chartId)
    if (!reportConfig) return false
    return !!restrictionsMap[reportConfig.reportPath]
}

export const useIsChartRestricted = (chartId: string) => {
    const {restrictionsMap} = useReportRestrictions()
    return isChartRestricted(restrictionsMap, chartId)
}
