import { useIntentsOverTimeTimeSeries } from 'hooks/reporting/voice-of-customer/useIntentsOverTimeTimeSeries'
import ChartCard from 'pages/stats/common/components/ChartCard'
import LineChart from 'pages/stats/common/components/charts/LineChart/LineChart'
import { formatLabeledTimeSeriesData } from 'pages/stats/common/utils'
import { LINES_COLORS } from 'pages/stats/constants'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'

export function TopAIIntentsOverTimeChart() {
    const {
        data,
        legendInfo,
        legendDatasetVisibility,
        granularity,
        isFetching,
    } = useIntentsOverTimeTimeSeries()

    const { hint, title } =
        ProductInsightsChartConfig[
            ProductInsightsChart.TopAIIntentsOverTimeChart
        ]

    return (
        <ChartCard title={title} hint={hint}>
            <LineChart
                isLoading={isFetching}
                customColors={LINES_COLORS}
                data={formatLabeledTimeSeriesData(
                    data,
                    legendInfo.tooltips,
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
        </ChartCard>
    )
}
