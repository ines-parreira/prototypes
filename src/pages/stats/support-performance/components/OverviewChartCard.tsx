import React from 'react'
import {TimeSeriesHook} from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import ChartCard from 'pages/stats/ChartCard'
import {formatTimeSeriesData} from 'pages/stats/common/utils'
import LineChart from 'pages/stats/LineChart'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'
import {TooltipData} from 'pages/stats/types'

export const OverviewChartCard = ({
    title,
    hint,
    useTimeSeries,
}: {
    title: string
    hint: TooltipData
    useTimeSeries: TimeSeriesHook
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
            <LineChart
                isLoading={!timeSeries.data}
                data={formatTimeSeriesData(timeSeries.data, title, granularity)}
                hasBackground
                _displayLegacyTooltip
            />
        </ChartCard>
    )
}
