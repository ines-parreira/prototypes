import { Skeleton } from '@gorgias/axiom'

import { useSatisfiedOrBreachedVoiceCallsTimeSeries } from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedVoiceCallsTimeSeries'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { BarChart } from 'domains/reporting/pages/common/components/charts/BarChart/BarChart'
import { formatLabeledTimeSeriesData } from 'domains/reporting/pages/common/utils'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import {
    CHART_COLORS,
    VoiceSLAStatus,
} from 'domains/reporting/pages/sla/constants'

export const ACHIEVED_AND_BREACHED_CALLS_CHART_TITLE =
    'Achieved and breached calls'
export const ACHIEVED_AND_BREACHED_CALLS_CHART_HINT =
    'Number of calls that satisfied and breached the SLA policy over time'

export const CHART_FIELDS = [
    {
        field: VoiceSLAStatus.Satisfied,
        label: 'Achieved',
    },
    {
        field: VoiceSLAStatus.Breached,
        label: 'Breached',
    },
]

export const AchievedAndBreachedVoiceCallsChart = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()

    const { data, isLoading } = useSatisfiedOrBreachedVoiceCallsTimeSeries(
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
            title={ACHIEVED_AND_BREACHED_CALLS_CHART_TITLE}
            hint={{ title: ACHIEVED_AND_BREACHED_CALLS_CHART_HINT }}
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
