import React, { useMemo } from 'react'

import { useAIAgentUserId } from 'hooks/reporting/automate/useAIAgentUserId'
import { useAutomateFilters } from 'hooks/reporting/automate/useAutomateFilters'
import { useAutomateMetricsTrend } from 'hooks/reporting/automate/useAutomationDataset'
import useAppSelector from 'hooks/useAppSelector'
import { FilterKey } from 'models/stat/types'
import { AutomatedInteractionsMetric } from 'pages/automate/automate-metrics/AutomatedInteractionsMetric'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { getStatsFiltersWithLogicalOperators } from 'state/stats/selectors'

export function AutomatedInteractionsMetricCard({
    chartId,
    dashboard,
}: DashboardChartProps) {
    const { userTimezone } = useAutomateFilters()

    const statsFilters = useAppSelector(getStatsFiltersWithLogicalOperators)

    const aiAgentUserId = useAIAgentUserId()

    const statsFiltersWithAiAgent = useMemo(
        () => ({
            ...statsFilters,
            [FilterKey.Agents]: {
                operator: LogicalOperatorEnum.ONE_OF,
                values: [Number(aiAgentUserId)],
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
