import useAppSelector from 'hooks/useAppSelector'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { TopAIIntentsForProductOverTimeGraph } from 'pages/stats/voice-of-customer/product-insights/components/TopAIIntentsForProductOverTimeGraph'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'
import { getSidePanelProduct } from 'state/ui/stats/sidePanelSlice'

export function TopAIIntentsForProductOverTimeChart() {
    const product = useAppSelector(getSidePanelProduct)

    const { hint, title } =
        ProductInsightsChartConfig[
            ProductInsightsChart.TopAIIntentsOverTimeChart
        ]

    return (
        <ChartCard title={title} hint={hint}>
            {product && (
                <TopAIIntentsForProductOverTimeGraph productId={product.id} />
            )}
        </ChartCard>
    )
}
