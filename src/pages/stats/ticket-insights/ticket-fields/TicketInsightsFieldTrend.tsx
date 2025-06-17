import { useTicketsFieldTimeSeries } from 'hooks/reporting/ticket-insights/useTicketsFieldTimeSeries'
import useAppSelector from 'hooks/useAppSelector'
import ChartCard from 'pages/stats/common/components/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import { formatLabeledTooltipTimeSeriesData } from 'pages/stats/common/utils'
import { LINES_COLORS } from 'pages/stats/constants'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import {
    TicketInsightsFieldsMetric,
    TicketInsightsFieldsMetricConfig,
} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsMetricConfig'
import { getSelectedCustomField } from 'state/ui/stats/ticketInsightsSlice'

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
