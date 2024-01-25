import {UseQueryResult} from '@tanstack/react-query'
import React from 'react'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import ChartCard from 'pages/stats/ChartCard'
import {formatTimeSeriesData} from 'pages/stats/common/utils'
import {DEFAULT_TIMEZONE} from 'pages/stats/constants'
import LineChart from 'pages/stats/LineChart'
import {MESSAGES_SENT_LABEL} from 'services/reporting/constants'
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
    useTimeSeries: (
        filters: StatsFilters,
        timezone: string,
        granularity: ReportingGranularity
    ) => UseQueryResult<TimeSeriesDataItem[][]>
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
                data={formatTimeSeriesData(
                    timeSeries.data,
                    MESSAGES_SENT_LABEL,
                    granularity
                )}
                hasBackground
                _displayLegacyTooltip
            />
        </ChartCard>
    )
}
