import React from 'react'

import {TimeSeriesHook} from 'hooks/reporting/useTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import ChartCard from 'pages/stats/ChartCard'
import BarChart from 'pages/stats/common/components/charts/BarChart/BarChart'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import {formatTimeSeriesData} from 'pages/stats/common/utils'
import {TooltipData} from 'pages/stats/types'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'

export const OverviewChartCard = ({
    title,
    hint,
    useTimeSeries,
    chartType,
    isAnalyticsNewFilters = false,
}: {
    title: string
    hint: TooltipData
    useTimeSeries: TimeSeriesHook
    chartType: 'bar' | 'line'
    isAnalyticsNewFilters?: boolean
}) => {
    const {cleanStatsFilters: legacyStatsFilters} = useAppSelector(
        getCleanStatsFiltersWithTimezone
    )
    const {
        cleanStatsFilters: statsFiltersWithLogicalOperators,
        userTimezone,
        granularity,
    } = useAppSelector(getCleanStatsFiltersWithLogicalOperatorsWithTimezone)

    const cleanStatsFilters = isAnalyticsNewFilters
        ? statsFiltersWithLogicalOperators
        : legacyStatsFilters

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
