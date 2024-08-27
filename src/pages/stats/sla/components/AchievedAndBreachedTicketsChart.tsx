import React from 'react'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {useSatisfiedOrBreachedTicketsTimeSeries} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import ChartCard from 'pages/stats/ChartCard'
import useAppSelector from 'hooks/useAppSelector'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import BarChart from 'pages/stats/common/components/charts/BarChart/BarChart'
import {formatLabeledTimeSeriesData} from 'pages/stats/common/utils'
import {
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
} from 'state/ui/stats/selectors'

import analyticsColors from 'assets/css/new/stats/modern.json'

export const CHART_TITLE = 'Achieved and breached tickets'
export const HINT =
    'Number of tickets that satisfied and breached the SLA policy over time'

const CHART_COLORS = [
    analyticsColors['analytics'].data.turquoise.value,
    analyticsColors['analytics'].data.yellow.value,
]

export const CHART_FIELDS = [
    {
        field: TicketSLAStatus.Satisfied,
        label: 'Achieved',
    },
    {
        field: TicketSLAStatus.Breached,
        label: 'Breached',
    },
]

export const AchievedAndBreachedTicketsChart = ({
    isAnalyticsNewFilters = false,
}: {
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

    const {data, isLoading} = useSatisfiedOrBreachedTicketsTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity
    )

    const formattedData = data
        ? CHART_FIELDS.map((metric) => metric.field).map((metric) =>
              data[metric] ? data[metric][0] : []
          )
        : []

    return isLoading ? (
        <Skeleton />
    ) : (
        <ChartCard title={CHART_TITLE} hint={{title: HINT}}>
            <BarChart
                data={
                    data !== undefined
                        ? formatLabeledTimeSeriesData(
                              formattedData,
                              CHART_FIELDS.map((metric) => metric.label),
                              granularity
                          )
                        : []
                }
                isStacked={true}
                isLoading={false}
                hasBackground
                _displayLegacyTooltip
                displayLegend
                legendOnLeft
                customColors={CHART_COLORS}
            />
        </ChartCard>
    )
}
