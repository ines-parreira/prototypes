import React, {useState} from 'react'

import Paywall, {UpgradeType} from 'pages/common/components/Paywall/Paywall'
import AutomationSubscriptionButton from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionButton'
import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import {assetsUrl} from 'utils'

const QuickResponsesPaywallView = () => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)

    return (
        <Paywall
            containerId="candu-quick-responses"
            pageHeader="Quick responses"
            header="Automate up to 25% of interactions with advanced automation features"
            description="Provide customers with automated responses to common questions with quick responses."
            previewImage={assetsUrl(
                '/img/paywalls/screens/quick-responses.png'
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

export default QuickResponsesPaywallView
