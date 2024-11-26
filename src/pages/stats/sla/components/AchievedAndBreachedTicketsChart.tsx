import React from 'react'

import analyticsColors from 'assets/css/new/stats/modern.json'
import {useSatisfiedOrBreachedTicketsTimeSeries} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import ChartCard from 'pages/stats/ChartCard'
import BarChart from 'pages/stats/common/components/charts/BarChart/BarChart'
import {formatLabeledTimeSeriesData} from 'pages/stats/common/utils'

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

export const AchievedAndBreachedTicketsChart = () => {
    const {cleanStatsFilters, userTimezone, granularity} = useNewStatsFilters()

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
