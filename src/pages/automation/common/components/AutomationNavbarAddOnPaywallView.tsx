import React, {useState} from 'react'

import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'

import AutomationNavbarAddOnPaywallNavbarLink from './AutomationNavbarAddOnPaywallNavbarLink'

const PAYWALL_ITEMS = [
    {name: 'Flow builder', slug: 'flows'},
    {name: 'Quick response flows', slug: 'quick-responses'},
    {name: 'Order management flows', slug: 'order-management'},
    {name: 'Article recommendation', slug: 'article-recommendation'},
] as const

const AutomationNavbarAddOnPaywallView = () => {
    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModalOpen,
    ] = useState(false)

    return (
        <>
            {PAYWALL_ITEMS.map((paywallItem) => (
                <AutomationNavbarAddOnPaywallNavbarLink
                    key={paywallItem.name}
                    to={`/app/automation/${paywallItem.slug}`}
                    onSubscribeToAutomationAddOnClick={() => {
                        setIsAutomationSubscriptionModalOpen(true)
                    }}
                >
                    {paywallItem.name}
                </AutomationNavbarAddOnPaywallNavbarLink>
            ))}
            <AutomationSubscriptionModal
                confirmLabel="Subscribe"
                isOpen={isAutomationSubscriptionModalOpen}
                onClose={() => setIsAutomationSubscriptionModalOpen(false)}
            />
        </>
    )
}

export default AutomationNavbarAddOnPaywallView
