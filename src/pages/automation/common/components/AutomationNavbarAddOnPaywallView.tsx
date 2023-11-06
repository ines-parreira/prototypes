import React from 'react'

import {useIsAutomateRebranding} from 'pages/automation/common/hooks/useIsAutomateRebranding'
import AutomationNavbarAddOnPaywallNavbarLink from './AutomationNavbarAddOnPaywallNavbarLink'
import {
    ARTICLE_RECOMMENDATION,
    FLOWS,
    ORDER_MANAGEMENT,
    QUICK_RESPONSES,
} from './constants'

const PAYWALL_ITEMS = [
    {name: FLOWS, slug: 'flows'},
    {name: QUICK_RESPONSES, slug: 'quick-responses'},
    {name: ORDER_MANAGEMENT, slug: 'order-management'},
    {name: ARTICLE_RECOMMENDATION, slug: 'article-recommendation'},
] as const

const AutomationNavbarAddOnPaywallView = () => {
    const {isAutomateRebranding} = useIsAutomateRebranding()
    return (
        <>
            {!isAutomateRebranding &&
                PAYWALL_ITEMS.map((paywallItem) => (
                    <AutomationNavbarAddOnPaywallNavbarLink
                        key={paywallItem.name}
                        to={`/app/automation/${paywallItem.slug}`}
                    >
                        {paywallItem.name}
                    </AutomationNavbarAddOnPaywallNavbarLink>
                ))}
        </>
    )
}

export default AutomationNavbarAddOnPaywallView
