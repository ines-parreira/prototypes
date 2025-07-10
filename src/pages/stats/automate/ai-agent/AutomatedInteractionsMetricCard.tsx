import React, { useMemo } from 'react'

import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { useAutomateMetricsTrend } from 'hooks/reporting/automate/useAutomationDataset'
import { MISSING_AI_AGENT_USER_ID } from 'hooks/reporting/automate/utils'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { FilterKey } from 'models/stat/types'
import { AutomatedInteractionsMetric } from 'pages/automate/automate-metrics/AutomatedInteractionsMetric'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { DashboardChartProps } from 'pages/stats/dashboards/types'

export function AutomatedInteractionsMetricCard({
    chartId,
    dashboard,
}: DashboardChartProps) {
    const { cleanStatsFilters: statsFilters, userTimezone } = useStatsFilters()

    const aiAgentUserId = useAIAgentUserId()

    const statsFiltersWithAiAgent = useMemo(
        () => ({
            ...statsFilters,
            [FilterKey.Agents]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [aiAgentUserId ?? MISSING_AI_AGENT_USER_ID],
            },
        }),
        [aiAgentUserId, statsFilters],
    )

    const { automatedInteractionTrend } = useAutomateMetricsTrend(
        {
            ...statsFiltersWithAiAgent,
            channels: {
                values: ['email'],
                operator: LogicalOperatorEnum.ONE_OF,
            },
        },
        userTimezone,
    )

    return (
        <AutomatedInteractionsMetric
            trend={automatedInteractionTrend}
            chartId={chartId}
            dashboard={dashboard}
        />
    )
}
