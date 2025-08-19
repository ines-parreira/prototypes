import { useLocalStorage } from '@repo/hooks'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { useAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { AAO_TIPS_VISIBILITY_KEY } from 'domains/reporting/pages/automate/overview/constants'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AutomationRateMetric } from 'pages/automate/automate-metrics'
import { OVERALL_AUTOMATION_RATE_LABEL } from 'pages/automate/automate-metrics/constants'

export const AutomationRateKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const isActionDrivenAiAgentNavigationEnabled: boolean | undefined = useFlag(
        FeatureFlagKey.ActionDrivenAiAgentNavigation,
    )
    const [areTipsVisible] = useLocalStorage(AAO_TIPS_VISIBILITY_KEY, true)
    const { statsFilters, userTimezone } = useAutomateFilters()
    const automationRateTrend = useAutomationRateTrend(
        statsFilters,
        userTimezone,
    )

    return (
        <AutomationRateMetric
            title={
                isActionDrivenAiAgentNavigationEnabled
                    ? OVERALL_AUTOMATION_RATE_LABEL
                    : undefined
            }
            trend={automationRateTrend}
            showTips={areTipsVisible && !isActionDrivenAiAgentNavigationEnabled}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
