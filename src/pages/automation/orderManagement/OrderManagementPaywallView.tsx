import React, {useState} from 'react'

import Paywall, {UpgradeType} from 'pages/common/components/Paywall/Paywall'
import AutomationSubscriptionButton from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionButton'
import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import {assetsUrl} from 'utils'

const OrderManagementPaywallView = () => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)

    return (
        <Paywall
            containerId="candu-order-management"
            pageHeader="Order management"
            header="Automate up to 25% of interactions with advanced automation features"
            description="Allow customers to manage their orders from your chat widget and Help Center with order management flows."
            previewImage={assetsUrl(
                '/img/paywalls/screens/order-management.png'
            )}
            requiredUpgrade="Automation"
            upgradeType={UpgradeType.AddOn}
            showUpgradeCta
            renderFilterShadow
            customCta={
                <AutomationSubscriptionButton
                    onClick={() => {
                        setIsAutomationModalOpened(true)
                    }}
                    label="Get Automation Add-on"
                />
            }
            modal={
                <AutomationSubscriptionModal
                    confirmLabel="Confirm"
                    isOpen={isAutomationModalOpened}
                    onClose={() => setIsAutomationModalOpened(false)}
                />
            }
        />
    )
}

export default OrderManagementPaywallView
