import { DisplayType } from 'components/Navigation/components/NavigationSectionItem'
import { Navigation } from 'components/Navigation/Navigation'
import { StatsNavSectionItem } from 'domains/reporting/pages/common/components/StatsNavbarView/StatsNavSectionItem'
import css from 'domains/reporting/pages/voice-of-customer/components/VoiceOfCustomerNavbarContainer/VoiceOfCustomerNavbarView.less'
import { PRODUCT_INSIGHTS_PAGE_TITLE } from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsPage'
import { useVoiceOfCustomerSections } from 'domains/reporting/pages/voice-of-customer/useVoiceOfCustomerSections'
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
