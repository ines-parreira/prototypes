import React, {useState} from 'react'

import AutomationSubscriptionModal from 'pages/settings/billing/automation/AutomationSubscriptionModal'

import AutomationNavbarAddOnPaywallViewItem from './AutomationNavbarAddOnPaywallViewItem'

const PAYWALL_ITEMS = [
    'Quick responses',
    'Order management',
    'Article recommendation',
]

const AutomationNavbarAddOnPaywallView = () => {
    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModal,
    ] = useState(false)

    return (
        <>
            <div className="mt-4">
                {PAYWALL_ITEMS.map((paywallItem) => (
                    <AutomationNavbarAddOnPaywallViewItem
                        key={paywallItem}
                        onSubscribeToAutomationAddOnClick={() => {
                            setIsAutomationSubscriptionModal(true)
                        }}
                    >
                        {paywallItem}
                    </AutomationNavbarAddOnPaywallViewItem>
                ))}
            </div>
            <AutomationSubscriptionModal
                confirmLabel="Subscribe"
                isOpen={isAutomationSubscriptionModalOpen}
                onClose={() => setIsAutomationSubscriptionModal(false)}
            />
        </>
    )
}

export default AutomationNavbarAddOnPaywallView
