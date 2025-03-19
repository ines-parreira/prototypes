import { TooltipItem } from 'chart.js'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { TimeSeriesHook } from 'hooks/reporting/useTimeSeries'
import {
    AiSalesAgentChart,
    AiSalesAgentChartConfig,
} from 'pages/stats/aiSalesAgent/AiSalesAgentMetricsConfig'
import ChartCard from 'pages/stats/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import { formatTimeSeriesData } from 'pages/stats/common/utils'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { TooltipData } from 'pages/stats/types'

export const percentLabel = (value: number | string) => {
    return typeof value === 'number'
        ? `${parseFloat((value * 100).toFixed(2))}%`
        : value
}

export const renderTooltipLabel = (isPercentage = false) => {
    return ({ raw, dataset }: TooltipItem<'line'>) => {
        return `${dataset?.label || ''}:  ${
            isPercentage ? percentLabel(raw as number) : (raw as number)
        }`
    }
}

const Chart = ({
    title,
    hint,
    useTimeSeries,
    dashboard,
    chartId,
}: {
    title: string
    hint?: TooltipData
    useTimeSeries: TimeSeriesHook
} & DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const timeSeries = useTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )

    return (
        <ChartCard
            title={title}
            chartId={chartId}
            dashboard={dashboard}
            hint={hint}
        >
            <LineChart
                isLoading={!timeSeries.data}
                data={formatTimeSeriesData(timeSeries.data, title, granularity)}
                renderYTickLabel={percentLabel}
                _renderLegacyTooltipLabel={renderTooltipLabel(true)}
                _displayLegacyTooltip
            />
        </ChartCard>
    )
}

const GmvInfluencedOverTimeChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    return (
        <Chart
            {...AiSalesAgentChartConfig[
                AiSalesAgentChart.AiSalesAgentGmvInfluencedOverTime
            ]}
            dashboard={dashboard}
            chartId={chartId}
        />
    )
}

export default GmvInfluencedOverTimeChart
