import { useMemo } from 'react'

import analyticsColorsModern from 'assets/css/new/stats/modern.json'
import { useAIAgentInteractionsBySkillTimeSeries } from 'hooks/reporting/automate/useAIAgentInteractionsBySkillTimeSeries'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { TimeSeriesDataItem } from 'hooks/reporting/useTimeSeries'
import { AIAgentSkills } from 'models/reporting/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { ReportingGranularity } from 'models/reporting/types'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { BarChart } from 'pages/stats/common/components/charts/BarChart/BarChart'
import { formatLabeledTimeSeriesData } from 'pages/stats/common/utils'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { TooltipData } from 'pages/stats/types'

export const AI_AGENT_AUTOMATED_INTERACTIONS_LABEL =
    'AI Agent automated interactions'
export const AI_AGENT_AUTOMATED_INTERACTIONS_TOOLTIP: TooltipData = {
    title: 'Number of automated interactions for the selected date period separated by Support or Sales skill usage',
}

export const AutomateCustomColors = [
    analyticsColorsModern.analytics.data.magenta.value,
    analyticsColorsModern.analytics.heatmap['heatmap-5'].value,
]

export const AUTOMATE_CHART_FIELDS = [
    {
        field: AIAgentSkills.AIAgentSupport,
        label: 'AI Agent Support',
    },
    {
        field: AIAgentSkills.AIAgentSales,
        label: 'AI Agent Sales',
    },
]

const getFormattedData = (
    data: Record<string, TimeSeriesDataItem[][]> | undefined,
    granularity: ReportingGranularity,
) => {
    if (data === undefined) {
        return []
    }

    const formattedData = AUTOMATE_CHART_FIELDS.map(
        (metric) => metric.field,
    ).map((metric) => (data[metric] ? data[metric][0] : []))

    return formatLabeledTimeSeriesData(
        formattedData,
        AUTOMATE_CHART_FIELDS.map((metric) => metric.label),
        granularity,
    )
}

export const AIAgentAutomatedInteractionsGraphBar = ({
    dashboard,
    chartId,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data, isLoading } = useAIAgentInteractionsBySkillTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )

    const formattedData = useMemo(
        () => getFormattedData(data, granularity),
        [data, granularity],
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
            />
        </ChartCard>
    )
}
