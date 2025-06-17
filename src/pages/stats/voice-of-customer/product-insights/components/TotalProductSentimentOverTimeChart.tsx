import analyticsColors from 'assets/css/new/stats/modern.json'
import { Sentiments } from 'hooks/reporting/types'
import { useTotalProductSentimentTimeSeries } from 'hooks/reporting/voice-of-customer/useTotalProductSentimentTimeSeries'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { BarChart } from 'pages/stats/common/components/charts/BarChart/BarChart'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'

export const CHART_COLORS = [
    analyticsColors['analytics'].data.pink.value,
    analyticsColors['analytics'].data['dark-blue'].value,
]

enum SentimentFields {
    Negative = 'negative',
    Positive = 'positive',
}

export const TOTAL_PRODUCTS_SENTIMENTS_CHART_FIELDS = [
    {
        field: SentimentFields.Negative,
        label: 'Negative',
    },
    {
        field: SentimentFields.Positive,
        label: 'Positive',
    },
]

const PRODUCT_SENTIMENT_VALUE_STRINGS = [
    Sentiments.Negative,
    Sentiments.Positive,
]

export const TotalProductSentimentOverTimeChart = () => {
    const { hint, title } =
        ProductInsightsChartConfig[
            ProductInsightsChart.TotalProductSentimentOverTimeChart
        ]

    const { data, isFetching } = useTotalProductSentimentTimeSeries(
        PRODUCT_SENTIMENT_VALUE_STRINGS,
    )

    return (
        <ChartCard title={title} hint={hint}>
            <BarChart
                data={data}
                isStacked
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
