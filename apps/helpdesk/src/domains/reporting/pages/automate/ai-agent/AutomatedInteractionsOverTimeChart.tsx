import { useMemo } from 'react'

import moment from 'moment'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { calculateGreyArea } from 'domains/reporting/hooks/automate/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { AutomatedInteractionsOverTime } from 'domains/reporting/pages/automate/ai-agent/AutomatedInteractionsOverTime'
import { getGreyAreaHint } from 'domains/reporting/pages/automate/overview/utils'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AUTOMATED_INTERACTION_TOOLTIP } from 'pages/automate/automate-metrics/constants'

export const AUTOMATED_INTERACTIONS_OVER_TIME_CHART_TITLE =
    'Automated interactions over time'

export function AutomatedInteractionsOverTimeChart({
    chartId,
    dashboard,
}: DashboardChartProps) {
    const { cleanStatsFilters: statsFilters } = useStatsFilters()
    const aiAgentUserId = useAIAgentUserId()

    const greyArea = useMemo(
        () =>
            calculateGreyArea(
                moment(statsFilters.period.start_datetime),
                moment(statsFilters.period.end_datetime),
            ),
        [statsFilters.period.end_datetime, statsFilters.period.start_datetime],
    )

    return (
        <ChartCard
            title={AUTOMATED_INTERACTIONS_OVER_TIME_CHART_TITLE}
            hint={AUTOMATED_INTERACTION_TOOLTIP}
            {...getGreyAreaHint(greyArea)}
            chartId={chartId}
            dashboard={dashboard}
        >
            {aiAgentUserId && (
                <AutomatedInteractionsOverTime
                    aiAgentUserId={aiAgentUserId}
                    greyArea={greyArea}
                />
            )}
        </ChartCard>
    )
}
