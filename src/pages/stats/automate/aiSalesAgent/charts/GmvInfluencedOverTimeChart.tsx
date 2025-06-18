import { useContext, useMemo } from 'react'

import { TooltipItem } from 'chart.js'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { TimeSeriesHook } from 'hooks/reporting/useTimeSeries'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'
import {
    AiSalesAgentChart,
    AiSalesAgentChartConfig,
} from 'pages/stats/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { WarningBannerContext } from 'pages/stats/automate/aiSalesAgent/components/WarningBannerProvider'
import ChartCard from 'pages/stats/common/components/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import { formatCurrency, formatTimeSeriesData } from 'pages/stats/common/utils'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { TooltipData } from 'pages/stats/types'

const useNullTimeSeries = () => {
    return {
        isFetching: false,
        isError: false,
        data: [],
    }
}

export const formatLabelValue = (
    value: number | string,
    currency: string = 'USD',
) => {
    return typeof value === 'number'
        ? `${formatCurrency(value, currency)}`
        : value
}

export const renderTooltipLabel = (
    isPercentage = false,
    currency: string = 'USD',
) => {
    return ({ raw, dataset }: TooltipItem<'line'>) => {
        return `${dataset?.label || ''}:  ${
            isPercentage
                ? formatLabelValue(raw as number, currency)
                : (raw as number)
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
    const { currency } = useCurrency()

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
                renderYTickLabel={(value) => formatLabelValue(value, currency)}
                _renderLegacyTooltipLabel={renderTooltipLabel(true, currency)}
                _displayLegacyTooltip
            />
        </ChartCard>
    )
}

const GmvInfluencedOverTimeChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const config =
        AiSalesAgentChartConfig[
            AiSalesAgentChart.AiSalesAgentGmvInfluencedOverTime
        ]

    const { isBannerVisible } = useContext(WarningBannerContext)

    const TrendCardComponent = useMemo(() => {
        const useTimeSeries = isBannerVisible
            ? useNullTimeSeries
            : config.useTimeSeries

        return () => (
            <Chart
                {...config}
                useTimeSeries={useTimeSeries}
                dashboard={dashboard}
                chartId={chartId}
            />
        )
    }, [isBannerVisible, config, chartId, dashboard])

    return <TrendCardComponent />
}

export default GmvInfluencedOverTimeChart
