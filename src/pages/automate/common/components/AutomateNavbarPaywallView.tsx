import React from 'react'

import {useIsAutomateRebranding} from 'pages/automate/common/hooks/useIsAutomateRebranding'
import AutomateNavbarPaywallNavbarLink from './AutomateNavbarPaywallNavbarLink'
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

const AutomateNavbarPaywallView = () => {
    const {isAutomateRebranding} = useIsAutomateRebranding()
    return (
        <>
            {!isAutomateRebranding &&
                PAYWALL_ITEMS.map((paywallItem) => (
                    <AutomateNavbarPaywallNavbarLink
                        key={paywallItem.name}
                        to={`/app/automation/${paywallItem.slug}`}
                    >
                        {paywallItem.name}
                    </AutomateNavbarPaywallNavbarLink>
                ))}
        </>
    )
}

export default AutomateNavbarPaywallView
