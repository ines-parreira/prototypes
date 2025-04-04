import React from 'react'

import cssNavbar from 'assets/css/navbar.less'
import { StatsNavLink } from 'pages/stats/common/components/StatsNavLink'
import { OVERVIEW_PAGE_TITLE } from 'pages/stats/voice-of-customer/overview/OverviewPage'
import { PRODUCT_INSIGHTS_PAGE_TITLE } from 'pages/stats/voice-of-customer/product-insights/ProductInsightsPage'
import { VOICE_OF_CUSTOMER_ROUTES } from 'routes/constants'

export const VoiceOfCustomerNavbarView = () => {
    return (
        <>
            <div className={cssNavbar.category}>
                <div className={cssNavbar.menu}>
                    <StatsNavLink
                        to={`${VOICE_OF_CUSTOMER_ROUTES.OVERVIEW}`}
                        title={OVERVIEW_PAGE_TITLE}
                    />
                    <StatsNavLink
                        to={`${VOICE_OF_CUSTOMER_ROUTES.PRODUCT_INSIGHTS}`}
                        title={PRODUCT_INSIGHTS_PAGE_TITLE}
                    />
                </div>
            </div>
        </>
    )
}
