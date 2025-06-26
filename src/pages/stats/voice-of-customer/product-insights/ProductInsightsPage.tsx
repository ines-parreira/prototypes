import StatsPage from 'pages/stats/common/layout/StatsPage'
import { VoCSidePanel } from 'pages/stats/voice-of-customer/components/VoCSidePanel/VoCSidePanel'
import { VOICE_OF_CUSTOMER_SECTION_NAME } from 'pages/stats/voice-of-customer/constants'
import { ProductInsightsReport } from 'pages/stats/voice-of-customer/product-insights/ProductInsightsReport'

export const PRODUCT_INSIGHTS_PAGE_TITLE = 'Product insights'

export const ProductInsightsPage = () => {
    return (
        <div className="full-width">
            <StatsPage title={VOICE_OF_CUSTOMER_SECTION_NAME}>
                <ProductInsightsReport />
                <VoCSidePanel />
            </StatsPage>
        </div>
    )
}
