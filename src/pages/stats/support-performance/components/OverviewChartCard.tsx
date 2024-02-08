import React from 'react'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import {TimeSeriesHook} from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import ChartCard from 'pages/stats/ChartCard'
import {formatTimeSeriesData} from 'pages/stats/common/utils'
import {DEFAULT_TIMEZONE} from 'pages/stats/constants'
import LineChart from 'pages/stats/LineChart'
import {getTimezone} from 'state/currentUser/selectors'
import {getPageStatsFilters} from 'state/stats/selectors'
import {periodToReportingGranularity} from 'utils/reporting'

export const OverviewChartCard = ({
    title,
    hint,
    useTimeSeries,
}: {
    title: string
    hint: string
    useTimeSeries: TimeSeriesHook
}) => {
    const userTimezone = useAppSelector(
        (state) => getTimezone(state) || DEFAULT_TIMEZONE
    )
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    const requestStatsFilters = useCleanStatsFilters(pageStatsFilters)

    const granularity = periodToReportingGranularity(requestStatsFilters.period)

    const timeSeries = useTimeSeries(
        requestStatsFilters,
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
