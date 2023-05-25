import React, {useState} from 'react'

import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import {slugify} from 'utils'

import AutomationNavbarAddOnPaywallNavbarLink from './AutomationNavbarAddOnPaywallNavbarLink'

const PAYWALL_ITEMS = [
    'Flows',
    'Quick responses',
    'Order management',
    'Article recommendation',
]

const AutomationNavbarAddOnPaywallView = () => {
    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModalOpen,
    ] = useState(false)
    const paywallItems = PAYWALL_ITEMS

    return (
        <>
            <div className="mt-4">
                {paywallItems.map((paywallItem) => (
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
