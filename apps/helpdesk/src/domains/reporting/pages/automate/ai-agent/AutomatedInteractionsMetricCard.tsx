import React, { useMemo } from 'react'

import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { useAutomateMetricsTrend } from 'domains/reporting/hooks/automate/useAutomationDataset'
import { MISSING_AI_AGENT_USER_ID } from 'domains/reporting/hooks/automate/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { AutomatedInteractionsMetric } from 'pages/automate/automate-metrics/AutomatedInteractionsMetric'

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
