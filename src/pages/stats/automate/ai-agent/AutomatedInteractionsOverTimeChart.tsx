import React, { useMemo } from 'react'

import moment from 'moment'

import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { calculateGreyArea } from 'hooks/reporting/automate/utils'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { AUTOMATED_INTERACTION_TOOLTIP } from 'pages/automate/automate-metrics/constants'
import { AutomatedInteractionsOverTime } from 'pages/stats/automate/ai-agent/AutomatedInteractionsOverTime'
import { getGreyAreaHint } from 'pages/stats/automate/overview/utils'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

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
