import { useContext, useMemo } from 'react'

import { TooltipItem } from 'chart.js'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { TimeSeriesHook } from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentOrdersDimension } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    AiSalesAgentChart,
    AiSalesAgentChartConfig,
} from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { WarningBannerContext } from 'domains/reporting/pages/automate/aiSalesAgent/components/WarningBannerProvider'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import {
    formatCurrency,
    formatTimeSeriesData,
} from 'domains/reporting/pages/common/utils'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { TooltipData } from 'domains/reporting/pages/types'
import { useCurrency } from 'pages/aiAgent/Overview/hooks/useCurrency'

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
    const { currency: fallbackCurrency } = useCurrency()

    const timeSeries = useTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )

    // Get currency from time series data or fallback to useCurrency
    const currency =
        (timeSeries.data?.[0]?.[0]?.rawData as any)?.[
            AiSalesAgentOrdersDimension.Currency
        ] || fallbackCurrency
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
