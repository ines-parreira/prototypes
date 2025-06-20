import { DisplayType } from 'components/Navigation/components/NavigationSectionItem'
import { Navigation } from 'components/Navigation/Navigation'
import { StatsNavSectionItem } from 'pages/stats/common/components/StatsNavbarView/StatsNavSectionItem'
import { PRODUCT_INSIGHTS_PAGE_TITLE } from 'pages/stats/voice-of-customer/product-insights/ProductInsightsPage'
import { useVoiceOfCustomerSections } from 'pages/stats/voice-of-customer/useVoiceOfCustomerSections'
import css from 'pages/stats/voice-of-customer/VoiceOfCustomerNavbarView.less'
import { VOICE_OF_CUSTOMER_ROUTES } from 'routes/constants'

export const VoiceOfCustomerNavbarView = () => {
    const { sections, handleNavigationStateChange } =
        useVoiceOfCustomerSections()

    return (
        <div className={css.navbar}>
            <Navigation.Root
                value={sections}
                onValueChange={handleNavigationStateChange}
            >
                <StatsNavSectionItem
                    to={`${VOICE_OF_CUSTOMER_ROUTES.PRODUCT_INSIGHTS}`}
                    displayType={DisplayType.Default}
                >
                    {PRODUCT_INSIGHTS_PAGE_TITLE}
                </StatsNavSectionItem>
            </Navigation.Root>
        </div>
    )
}
