import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { AutomateAiAgentsReportConfig } from 'pages/stats/automate/ai-agent/AutomateAiAgentsReportConfig'
import { AiSalesAgentReportConfig } from 'pages/stats/automate/aiSalesAgent/AiSalesAgentReportConfig'
import { getComponentConfig } from 'pages/stats/dashboards/config'
import { HelpCenterReportConfig } from 'pages/stats/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import { SatisfactionReportConfig } from 'pages/stats/quality-management/satisfaction/SatisfactionReportConfig'
import { AutoQAReportConfig } from 'pages/stats/support-performance/auto-qa/AutoQAReportConfig'
import { SupportPerformanceSatisfactionReportConfig } from 'pages/stats/support-performance/satisfaction/SupportPerformanceSatisfactionReportConfig'
import { VoiceOverviewChart } from 'pages/stats/voice/pages/VoiceOverviewReportConfig'
import { BASE_VOICE_OF_CUSTOMER_PATH } from 'routes/constants'
import { getHasAutomate } from 'state/billing/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isTeamLead } from 'utils'

export type RestrictionsMap = Record<string, boolean | undefined>

export const useReportRestrictions = () => {
    const isNewSatisfactionReportEnabled =
        useFlags()[FeatureFlagKey.NewSatisfactionReport]
    const isHelpCenterAnalyticsEnabled =
        useFlags()[FeatureFlagKey.HelpCenterAnalytics]
    const isAiAgentStatsPageEnabled =
        useFlags()[FeatureFlagKey.AIAgentStatsPage]
    const isStandaloneSalesOverviewEnabled =
        useFlags()[FeatureFlagKey.StandaloneAiSalesAnalyticsPage]
    const shouldShowNewUnansweredStatuses =
        useFlags()[FeatureFlagKey.ShowNewUnansweredStatuses]
    const isReportingVoiceOfCustomerEnabled =
        !!useFlags()[FeatureFlagKey.ReportingVoiceOfCustomer]

    const user = useAppSelector(getCurrentUser)
    const hasAutomate = useAppSelector(getHasAutomate)
    const isTeamLeadOrAdmin = isTeamLead(user)
    const isAutoQANavLinkAvailable = useMemo(
        () => isTeamLeadOrAdmin && hasAutomate,
        [hasAutomate, isTeamLeadOrAdmin],
    )
    const reportRestrictionsMap: RestrictionsMap = useMemo(
        () => ({
            [HelpCenterReportConfig.id]: !isHelpCenterAnalyticsEnabled,
            [SatisfactionReportConfig.id]: !isNewSatisfactionReportEnabled,
            [SupportPerformanceSatisfactionReportConfig.id]:
                isNewSatisfactionReportEnabled,
            [AutoQAReportConfig.id]: !isAutoQANavLinkAvailable,
            [AutomateAiAgentsReportConfig.id]: !isAiAgentStatsPageEnabled,
            [AiSalesAgentReportConfig.id]: !isStandaloneSalesOverviewEnabled,
        }),
        [
            isAiAgentStatsPageEnabled,
            isAutoQANavLinkAvailable,
            isHelpCenterAnalyticsEnabled,
            isNewSatisfactionReportEnabled,
            isStandaloneSalesOverviewEnabled,
        ],
    )

    const chartRestrictionsMap: RestrictionsMap = useMemo(
        () => ({
            [VoiceOverviewChart.DEPRECATED_VoiceCallVolumeMetricMissedCallsCountTrendChart]:
                shouldShowNewUnansweredStatuses,
            [VoiceOverviewChart.VoiceCallVolumeMetricUnansweredCallsCountTrendChart]:
                !shouldShowNewUnansweredStatuses,
            [VoiceOverviewChart.VoiceCallVolumeMetricMissedCallsCountTrendChart]:
                !shouldShowNewUnansweredStatuses,
            [VoiceOverviewChart.VoiceCallVolumeMetricAbandonedCallsCountTrendChart]:
                !shouldShowNewUnansweredStatuses,
            [VoiceOverviewChart.VoiceCallVolumeMetricCancelledCallsCountTrendChart]:
                !shouldShowNewUnansweredStatuses,
        }),
        [shouldShowNewUnansweredStatuses],
    )

    const moduleRestrictionsMap: RestrictionsMap = useMemo(
        () => ({
            [BASE_VOICE_OF_CUSTOMER_PATH]: !isReportingVoiceOfCustomerEnabled,
        }),
        [isReportingVoiceOfCustomerEnabled],
    )

    return {
        reportRestrictionsMap,
        chartRestrictionsMap,
        moduleRestrictionsMap,
    }
}

export const isChartRestricted = (
    reportRestrictionsMap: RestrictionsMap,
    chartRestrictionsMap: RestrictionsMap,
    chartId: string,
) => {
    const { reportConfig } = getComponentConfig(chartId)
    if (!reportConfig) return false
    return (
        !!reportRestrictionsMap[reportConfig.id] ||
        chartRestrictionsMap[chartId] === true
    )
}

export const useIsChartRestricted = (chartId: string) => {
    const { reportRestrictionsMap, chartRestrictionsMap } =
        useReportRestrictions()
    return isChartRestricted(
        reportRestrictionsMap,
        chartRestrictionsMap,
        chartId,
    )
}
