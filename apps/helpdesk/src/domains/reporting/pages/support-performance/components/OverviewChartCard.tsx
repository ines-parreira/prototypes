import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { TimeSeriesHook } from 'domains/reporting/hooks/useTimeSeries'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import BarChart from 'domains/reporting/pages/common/components/charts/BarChart/BarChart'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { formatTimeSeriesData } from 'domains/reporting/pages/common/utils'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import type { TooltipData } from 'domains/reporting/pages/types'

export const OverviewChartCard = ({
    title,
    hint,
    useTimeSeries,
    chartType,
    dashboard,
    chartId,
}: {
    title: string
    hint: TooltipData
    useTimeSeries: TimeSeriesHook
    chartType: 'bar' | 'line'
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
            hint={hint}
            chartId={chartId}
            dashboard={dashboard}
        >
            {chartType === 'bar' ? (
                <BarChart
                    isLoading={!timeSeries.data}
                    data={formatTimeSeriesData(
                        timeSeries.data,
                        title,
                        granularity,
                    )}
                    hasBackground
                    _displayLegacyTooltip
                />
            ) : (
                <LineChart
                    isLoading={!timeSeries.data}
                    data={formatTimeSeriesData(
                        timeSeries.data,
                        title,
                        granularity,
                    )}
                    hasBackground
                    _displayLegacyTooltip
                />
            )}
        </ChartCard>
    )
}
