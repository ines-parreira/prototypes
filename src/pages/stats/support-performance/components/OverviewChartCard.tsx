import React from 'react'
import {TimeSeriesHook} from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import ChartCard from 'pages/stats/ChartCard'
import {formatTimeSeriesData} from 'pages/stats/common/utils'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {TooltipData} from 'pages/stats/types'
import BarChart from 'pages/stats/common/components/charts/BarChart/BarChart'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'

export const OverviewChartCard = ({
    title,
    hint,
    useTimeSeries,
    chartType,
}: {
    title: string
    hint: TooltipData
    useTimeSeries: TimeSeriesHook
    chartType: 'bar' | 'line'
}) => {
    const {cleanStatsFilters, userTimezone, granularity} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const timeSeries = useTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity
    )

    return (
        <ChartCard title={title} hint={hint}>
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
