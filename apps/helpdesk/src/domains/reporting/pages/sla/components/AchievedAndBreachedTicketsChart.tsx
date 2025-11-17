import { Skeleton } from '@gorgias/axiom'

import analyticsColors from 'assets/css/new/stats/modern.json'
import { useSatisfiedOrBreachedTicketsTimeSeries } from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { TicketSLAStatus } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import BarChart from 'domains/reporting/pages/common/components/charts/BarChart/BarChart'
import { formatLabeledTimeSeriesData } from 'domains/reporting/pages/common/utils'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

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
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data, isLoading } = useSatisfiedOrBreachedTicketsTimeSeries(
        cleanStatsFilters,
        userTimezone,
        granularity,
    )

    const formattedData = data
        ? CHART_FIELDS.map((metric) => metric.field).map((metric) =>
              data[metric] ? data[metric][0] : [],
          )
        : []

    return isLoading ? (
        <Skeleton />
    ) : (
        <ChartCard
            title={CHART_TITLE}
            hint={{ title: HINT }}
            chartId={chartId}
            dashboard={dashboard}
        >
            <BarChart
                data={
                    data !== undefined
                        ? formatLabeledTimeSeriesData(
                              formattedData,
                              CHART_FIELDS.map((metric) => metric.label),
                              granularity,
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
