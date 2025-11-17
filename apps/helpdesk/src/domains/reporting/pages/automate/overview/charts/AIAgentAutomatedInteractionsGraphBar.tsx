import { useMemo } from 'react'

import analyticsColorsModern from 'assets/css/new/stats/modern.json'
import { useAIAgentInteractionsBySkillTimeSeries } from 'domains/reporting/hooks/automate/useAIAgentInteractionsBySkillTimeSeries'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { BarChart } from 'domains/reporting/pages/common/components/charts/BarChart/BarChart'
import { formatLabeledTimeSeriesData } from 'domains/reporting/pages/common/utils'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import type { TooltipData } from 'domains/reporting/pages/types'
import { useAiAgentTypeForAccount } from 'pages/aiAgent/Overview/hooks/useAiAgentType'

export const AI_AGENT_AUTOMATED_INTERACTIONS_LABEL =
    'AI Agent automated interactions'
export const AI_AGENT_AUTOMATED_INTERACTIONS_TOOLTIP: TooltipData = {
    title: 'Number of automated interactions for the selected date period separated by Support or Sales skill usage. Only data after May 1 is displayed.',
}

export const AutomateCustomColors = [
    analyticsColorsModern.analytics.data.magenta.value,
    analyticsColorsModern.analytics.heatmap['heatmap-5'].value,
]

export const AI_AGENT_CHART_FIELDS = [
    {
        field: AIAgentSkills.AIAgentSupport,
        label: 'Support Agent Skill',
    },
    {
        field: AIAgentSkills.AIAgentSales,
        label: 'Shopping Assistant Skill',
    },
]

const getFormattedData = (
    data: Record<string, TimeSeriesDataItem[][]> | undefined,
    granularity: ReportingGranularity,
    isAIAgentSalesDisabled: boolean,
) => {
    if (data === undefined) {
        return []
    }

    const formattedData = AI_AGENT_CHART_FIELDS.map(
        (metric) => metric.field,
    ).map((metric) => (data[metric] ? data[metric][0] : []))

    const shouldDisableItem = (label: string) =>
        label === AI_AGENT_CHART_FIELDS[1].label && isAIAgentSalesDisabled

    return formatLabeledTimeSeriesData(
        formattedData,
        AI_AGENT_CHART_FIELDS.map((metric) => metric.label),
        granularity,
        shouldDisableItem,
    )
}

export const AIAgentAutomatedInteractionsGraphBar = ({
    dashboard,
    chartId,
}: DashboardChartProps) => {
    const { aiAgentType } = useAiAgentTypeForAccount()
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data, isLoading } = useAIAgentInteractionsBySkillTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )

    const isAIAgentSalesDisabled = aiAgentType === 'support'

    const formattedData = useMemo(
        () => getFormattedData(data, granularity, isAIAgentSalesDisabled),
        [data, granularity, isAIAgentSalesDisabled],
    )

    return (
        <ChartCard
            title={AI_AGENT_AUTOMATED_INTERACTIONS_LABEL}
            hint={AI_AGENT_AUTOMATED_INTERACTIONS_TOOLTIP}
            dashboard={dashboard}
            chartId={chartId}
        >
            <BarChart
                data={formattedData}
                customColors={AutomateCustomColors}
                isLoading={isLoading}
                toggleLegend
                displayLegend
                hasBackground
                isStacked
                legendOnLeft
                withTooltipTotal
                defaultDatasetVisibility={{
                    0: true,
                    1: !isAIAgentSalesDisabled,
                }}
            />
        </ChartCard>
    )
}
