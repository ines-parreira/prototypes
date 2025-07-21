import { useTagsTimeSeries } from 'domains/reporting/hooks/ticket-insights/useTagsTimeSeries'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { formatLabeledTooltipTimeSeriesData } from 'domains/reporting/pages/common/utils'
import { LINES_COLORS } from 'domains/reporting/pages/constants'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import {
    TicketInsightsTagsMetric,
    TicketInsightsTagsMetricConfig,
} from 'domains/reporting/pages/ticket-insights/tags/TagsMetricConfig'

export function TagsTrendChart({ chartId, dashboard }: DashboardChartProps) {
    const {
        data,
        legendInfo,
        legendDatasetVisibility,
        granularity,
        isFetching,
    } = useTagsTimeSeries()

    const { hint, title } =
        TicketInsightsTagsMetricConfig[TicketInsightsTagsMetric.TagsTrendChart]

    return (
        <ChartCard
            title={title}
            hint={hint}
            chartId={chartId}
            dashboard={dashboard}
        >
            <LineChart
                isLoading={isFetching}
                customColors={LINES_COLORS}
                data={formatLabeledTooltipTimeSeriesData(
                    data,
                    legendInfo,
                    granularity,
                )}
                displayLegend
                toggleLegend
                legendOnLeft
                wrapperclassNames="full-width"
                skeletonHeight={328}
                defaultDatasetVisibility={legendDatasetVisibility}
                options={{
                    scales: {
                        y: {
                            ticks: {
                                precision: 0,
                            },
                        },
                    },
                }}
            />
        </ChartCard>
    )
}
