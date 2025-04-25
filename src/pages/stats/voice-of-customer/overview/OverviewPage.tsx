import StatsPage from 'pages/stats/common/layout/StatsPage'
import { ProductInsightsPlaceholderReport } from 'pages/stats/voice-of-customer/product-insights/placeholder/ProducInsightsPlaceholderReport'
import { VoCSidePanel } from 'pages/stats/voice-of-customer/side-panel/VoCSidePanel'
import { VOICE_OF_CUSTOMER_SECTION_NAME } from 'pages/stats/voice-of-customer/VoiceOfCustomerNavbarContainer'

export const OverviewPage = () => {
    return (
        <div className="full-width">
            <StatsPage title={VOICE_OF_CUSTOMER_SECTION_NAME}>
                <ProductInsightsPlaceholderReport />
                <VoCSidePanel />
            </StatsPage>
        </div>
    )
}
