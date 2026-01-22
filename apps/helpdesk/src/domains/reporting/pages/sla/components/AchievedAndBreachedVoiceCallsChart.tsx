import { Skeleton } from '@gorgias/axiom'

import { useSatisfiedOrBreachedVoiceCallsTimeSeries } from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedVoiceCallsTimeSeries'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { VoiceSLAStatus } from 'domains/reporting/models/scopes/voiceSLA'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { BarChart } from 'domains/reporting/pages/common/components/charts/BarChart/BarChart'
import { formatLabeledTimeSeriesData } from 'domains/reporting/pages/common/utils'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import { CHART_COLORS } from 'domains/reporting/pages/sla/constants'

export const CHART_TITLE = 'Achieved and breached calls'
export const HINT =
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
                              data,
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
