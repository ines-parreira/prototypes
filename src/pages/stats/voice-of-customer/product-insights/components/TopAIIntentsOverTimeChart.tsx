import ChartCard from 'pages/stats/common/components/ChartCard'
import { TopAIIntentsOverTimeGraph } from 'pages/stats/voice-of-customer/product-insights/components/TopAIIntentsOverTimeGraph'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'

export function TopAIIntentsOverTimeChart() {
    const { hint, title } =
        ProductInsightsChartConfig[
            ProductInsightsChart.TopAIIntentsOverTimeChart
        ]

    return (
        <ChartCard title={title} hint={hint}>
            <TopAIIntentsOverTimeGraph />
        </ChartCard>
    )
}
