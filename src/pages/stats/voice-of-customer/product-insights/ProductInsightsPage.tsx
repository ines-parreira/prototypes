import StatsPage from 'pages/stats/common/layout/StatsPage'
import { ProductInsightsPlaceholderReport } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProducInsightsPlaceholderReport'
import { VOICE_OF_CUSTOMER_SECTION_NAME } from 'pages/stats/voice-of-customer/utils'

export const PRODUCT_INSIGHTS_PAGE_TITLE = 'Product insights'

export const ProductInsightsPage = () => {
    return (
        <div className="full-width">
            <StatsPage title={VOICE_OF_CUSTOMER_SECTION_NAME}>
                <ProductInsightsPlaceholderReport />
            </StatsPage>
        </div>
    )
}
