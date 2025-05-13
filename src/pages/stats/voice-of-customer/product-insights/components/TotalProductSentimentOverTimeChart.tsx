import analyticsColors from 'assets/css/new/stats/modern.json'
import { useTotalProductSentimentTimeSeries } from 'hooks/reporting/voice-of-customer/useTotalProductSentimentTimeSeries'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { BarChart } from 'pages/stats/common/components/charts/BarChart/BarChart'
import { formatLabeledTimeSeriesData } from 'pages/stats/common/utils'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'

export const CHART_COLORS = [
    analyticsColors['analytics'].data.pink.value,
    analyticsColors['analytics'].data['dark-blue'].value,
]

enum Sentiment {
    Negative = 'negative',
    Positive = 'positive',
}

export const CHART_FIELDS = [
    {
        field: Sentiment.Negative,
        label: 'Negative',
    },
    {
        field: Sentiment.Positive,
        label: 'Positive',
    },
]

export const TotalProductSentimentOverTimeChart = () => {
    const { hint, title } =
        ProductInsightsChartConfig[
            ProductInsightsChart.TotalProductSentimentOverTimeChart
        ]

    const { data, granularity, isFetching } =
        useTotalProductSentimentTimeSeries()

    return (
        <ChartCard title={title} hint={hint}>
            <BarChart
                data={formatLabeledTimeSeriesData(
                    data,
                    CHART_FIELDS.map((metric) => metric.label),
                    granularity,
                )}
                isStacked={true}
                isLoading={isFetching}
                hasBackground
                _displayLegacyTooltip
                displayLegend
                legendOnLeft
                customColors={CHART_COLORS}
            />
        </ChartCard>
    )
}
