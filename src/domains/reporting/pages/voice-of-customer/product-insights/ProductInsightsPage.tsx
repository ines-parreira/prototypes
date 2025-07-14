import StatsPage, {
    StatsPageBackgroundColor,
} from 'domains/reporting/pages/common/layout/StatsPage'
import { VoCSidePanel } from 'domains/reporting/pages/voice-of-customer/components/VoCSidePanel/VoCSidePanel'
import { VOICE_OF_CUSTOMER_SECTION_NAME } from 'domains/reporting/pages/voice-of-customer/constants'
import { ProductInsightsReport } from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsReport'

export const PRODUCT_INSIGHTS_PAGE_TITLE = 'Product insights'

export const ProductInsightsPage = () => {
    return (
        <div className="full-width">
            <StatsPage
                title={VOICE_OF_CUSTOMER_SECTION_NAME}
                backgroundColor={StatsPageBackgroundColor.Grey}
            >
                <ProductInsightsReport />
                <VoCSidePanel />
            </StatsPage>
        </div>
    )
}
