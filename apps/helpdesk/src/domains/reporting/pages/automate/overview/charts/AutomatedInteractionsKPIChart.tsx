import { useLocalStorage } from '@repo/hooks'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { AAO_TIPS_VISIBILITY_KEY } from 'domains/reporting/pages/automate/overview/constants'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AutomatedInteractionsMetric } from 'pages/automate/automate-metrics'
import { OVERALL_AUTOMATED_INTERACTIONS_LABEL } from 'pages/automate/automate-metrics/constants'

export const AutomatedInteractionsKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const isActionDrivenAiAgentNavigationEnabled: boolean | undefined = useFlag(
        FeatureFlagKey.ActionDrivenAiAgentNavigation,
    )
    const [areTipsVisible] = useLocalStorage(AAO_TIPS_VISIBILITY_KEY, true)
    const { statsFilters, userTimezone } = useAutomateFilters()
    const automatedInteractionTrend = useFilteredAutomatedInteractions(
        statsFilters,
        userTimezone,
    )

    return (
        <AutomatedInteractionsMetric
            title={
                isActionDrivenAiAgentNavigationEnabled
                    ? OVERALL_AUTOMATED_INTERACTIONS_LABEL
                    : undefined
            }
            trend={automatedInteractionTrend}
            showTips={areTipsVisible && !isActionDrivenAiAgentNavigationEnabled}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
