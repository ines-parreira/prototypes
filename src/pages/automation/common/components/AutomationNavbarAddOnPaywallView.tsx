import React, {useState} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import {slugify} from 'utils'
import {FeatureFlagKey} from 'config/featureFlags'

import AutomationNavbarAddOnPaywallNavbarLink from './AutomationNavbarAddOnPaywallNavbarLink'

const PAYWALL_ITEMS = [
    'Quick responses',
    'Order management',
    'Article recommendation',
]
const PAYWALL_ITEMS_WITH_WORKFLOWS = ['Flows', ...PAYWALL_ITEMS]

const AutomationNavbarAddOnPaywallView = () => {
    const [
        isAutomationSubscriptionModalOpen,
        setIsAutomationSubscriptionModalOpen,
    ] = useState(false)
    const isflowsBetaEnabled = useFlags()[FeatureFlagKey.FlowsBeta]

    const paywallItems = isflowsBetaEnabled
        ? PAYWALL_ITEMS_WITH_WORKFLOWS
        : PAYWALL_ITEMS

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
