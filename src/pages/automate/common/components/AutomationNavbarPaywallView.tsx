import React from 'react'

import {useIsAutomateRebranding} from 'pages/automate/common/hooks/useIsAutomateRebranding'
import AutomationNavbarPaywallNavbarLink from './AutomationNavbarPaywallNavbarLink'
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

const AutomationNavbarPaywallView = () => {
    const {isAutomateRebranding} = useIsAutomateRebranding()
    return (
        <>
            {!isAutomateRebranding &&
                PAYWALL_ITEMS.map((paywallItem) => (
                    <AutomationNavbarPaywallNavbarLink
                        key={paywallItem.name}
                        to={`/app/automation/${paywallItem.slug}`}
                    >
                        {paywallItem.name}
                    </AutomationNavbarPaywallNavbarLink>
                ))}
        </>
    )
}

export default AutomationNavbarPaywallView
