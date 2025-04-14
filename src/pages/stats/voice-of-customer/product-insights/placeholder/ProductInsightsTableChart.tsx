import ChartCard from 'pages/stats/common/components/ChartCard'
import { ProductInsightsCardExtra } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsCardExtra'
import { ProductInsightsTable } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProductInsightsTable'

export const PRODUCT_INSIGHTS_TABLE_TITLE = 'Product centric insights'

export const ProductInsightsTableChart = () => {
    return (
        <ChartCard
            title={PRODUCT_INSIGHTS_TABLE_TITLE}
            noPadding
            titleExtra={<ProductInsightsCardExtra />}
        >
            <ProductInsightsTable />
        </ChartCard>
    )
}
