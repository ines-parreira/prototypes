import React from 'react'

import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {TimeSeriesHook} from 'hooks/reporting/useTimeSeries'
import ChartCard from 'pages/stats/ChartCard'
import BarChart from 'pages/stats/common/components/charts/BarChart/BarChart'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import {formatTimeSeriesData} from 'pages/stats/common/utils'
import {DashboardChartProps} from 'pages/stats/custom-reports/types'
import {TooltipData} from 'pages/stats/types'

export const OverviewChartCard = ({
    title,
    hint,
    useTimeSeries,
    chartType,
    chartId,
}: {
    title: string
    hint: TooltipData
    useTimeSeries: TimeSeriesHook
    chartType: 'bar' | 'line'
} & DashboardChartProps) => {
    const {cleanStatsFilters, userTimezone, granularity} = useNewStatsFilters()

    const timeSeries = useTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity
    )

    return (
        <ChartCard title={title} hint={hint} chartId={chartId}>
            {chartType === 'bar' ? (
                <BarChart
                    isLoading={!timeSeries.data}
                    data={formatTimeSeriesData(
                        timeSeries.data,
                        title,
                        granularity
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
                        granularity
                    )}
                    hasBackground
                    _displayLegacyTooltip
                />
            )}
        </ChartCard>
    )
}
