import { useTicketsFieldTimeSeries } from 'domains/reporting/hooks/ticket-insights/useTicketsFieldTimeSeries'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { formatLabeledTooltipTimeSeriesData } from 'domains/reporting/pages/common/utils'
import { LINES_COLORS } from 'domains/reporting/pages/constants'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import {
    TicketInsightsFieldsMetric,
    TicketInsightsFieldsMetricConfig,
} from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldsMetricConfig'
import { getSelectedCustomField } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import useAppSelector from 'hooks/useAppSelector'

export function TicketInsightsFieldTrend({
    chartId,
    dashboard,
}: DashboardChartProps) {
    const selectedCustomField = useAppSelector(getSelectedCustomField)

    const { hint, title } =
        TicketInsightsFieldsMetricConfig[
            TicketInsightsFieldsMetric.TicketInsightsFieldTrend
        ]

    return (
        <ChartCard
            title={title}
            hint={hint}
            chartId={chartId}
            dashboard={dashboard}
        >
            {selectedCustomField && selectedCustomField.id !== null && (
                <TicketInsightsFieldTrendContent
                    selectedCustomField={selectedCustomField.id}
                />
            )}
        </ChartCard>
    )
}

const TicketInsightsFieldTrendContent = ({
    selectedCustomField,
}: {
    selectedCustomField: number
}) => {
    const {
        data,
        legendInfo,
        legendDatasetVisibility,
        granularity,
        isFetching,
    } = useTicketsFieldTimeSeries(selectedCustomField)

    return (
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
    )
}
