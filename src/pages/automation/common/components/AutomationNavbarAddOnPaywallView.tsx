import React, {useState} from 'react'

import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import {slugify} from 'utils'

import AutomationNavbarAddOnPaywallNavbarLink from './AutomationNavbarAddOnPaywallNavbarLink'

const PAYWALL_ITEMS = [
    'Quick responses',
    'Order management',
    'Article recommendation',
]

const AutomationNavbarAddOnPaywallView = () => {
    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModalOpen,
    ] = useState(false)

    return (
        <>
            <div className="mt-4">
                {PAYWALL_ITEMS.map((paywallItem) => (
                    <AutomationNavbarAddOnPaywallNavbarLink
                        key={paywallItem}
                        to={`/app/automation/${slugify(paywallItem)}`}
                        onSubscribeToAutomationAddOnClick={() => {
                            setIsAutomationSubscriptionModalOpen(true)
                        }}
                    >
                        {paywallItem}
                    </AutomationNavbarAddOnPaywallNavbarLink>
                ))}
            </div>
            <AutomationSubscriptionModal
                confirmLabel="Subscribe"
                isOpen={isAutomationSubscriptionModalOpen}
                onClose={() => setIsAutomationSubscriptionModalOpen(false)}
            />
        </>
    )
}

export default AutomationNavbarAddOnPaywallView
