import { useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { AutomateAiAgentsReportConfig } from 'domains/reporting/pages/automate/ai-agent/AutomateAiAgentsReportConfig'
import { AiSalesAgentReportConfig } from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentReportConfig'
import { AutomateOverviewChart } from 'domains/reporting/pages/automate/overview/AutomateOverviewReportConfig'
import { getComponentConfig } from 'domains/reporting/pages/dashboards/config'
import { HelpCenterReportConfig } from 'domains/reporting/pages/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import { SatisfactionReportConfig } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReportConfig'
import { AutoQAReportConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAReportConfig'
import { SupportPerformanceSatisfactionReportConfig } from 'domains/reporting/pages/support-performance/satisfaction/SupportPerformanceSatisfactionReportConfig'
import useAppSelector from 'hooks/useAppSelector'
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
        useFlags()[FeatureFlagKey.AiShoppingAssistantEnabled]
    const isReportingVoiceOfCustomerEnabled =
        useFlags()[FeatureFlagKey.ReportingVoiceOfCustomer]
    const isAutomateAIAgentInteractionsEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AutomateAIAgentInteractions]

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
            [AutomateOverviewChart.AIAgentAutomatedInteractionsGraphBar]:
                !isAutomateAIAgentInteractionsEnabled,
        }),
        [isAutomateAIAgentInteractionsEnabled],
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
