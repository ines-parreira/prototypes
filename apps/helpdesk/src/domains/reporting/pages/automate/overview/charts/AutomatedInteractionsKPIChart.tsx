import { useLocalStorage } from '@repo/hooks'

import { useFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { AAO_TIPS_VISIBILITY_KEY } from 'domains/reporting/pages/automate/overview/constants'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AutomatedInteractionsMetric } from 'pages/automate/automate-metrics'

export const AutomatedInteractionsKPIChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const [areTipsVisible] = useLocalStorage(AAO_TIPS_VISIBILITY_KEY, true)
    const { statsFilters, userTimezone } = useAutomateFilters()
    const automatedInteractionTrend = useFilteredAutomatedInteractions(
        statsFilters,
        userTimezone,
    )

    return (
        <AutomatedInteractionsMetric
            trend={automatedInteractionTrend}
            showTips={areTipsVisible}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}
