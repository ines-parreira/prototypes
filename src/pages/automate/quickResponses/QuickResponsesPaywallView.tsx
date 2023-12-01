import React, {useState} from 'react'

import Paywall, {UpgradeType} from 'pages/common/components/Paywall/Paywall'
import {withCanduPaywall} from 'pages/common/components/Paywall/CanduPaywall'
import AutomationSubscriptionButton from 'pages/settings/billing/automate/AutomationSubscriptionButton'
import AutomationSubscriptionModal from 'pages/settings/billing/automate/AutomationSubscriptionModal'
import {assetsUrl} from 'utils'
import {QUICK_RESPONSES} from '../common/components/constants'

const QuickResponsesPaywallView = () => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)

    return (
        <Paywall
            pageHeader={QUICK_RESPONSES}
            header="Automate up to 25% of interactions with advanced automation features"
            description="Provide customers with automated responses to common questions with quick response flows."
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
                    label="Get Automate Features"
                />
            }
            modal={
                <AutomationSubscriptionModal
                    confirmLabel="Subscribe"
                    isOpen={isAutomationModalOpened}
                    onClose={() => setIsAutomationModalOpened(false)}
                />
            }
        />
    )
}

export default withCanduPaywall({
    title: QUICK_RESPONSES,
    canduId: 'quick-responses-paywall',
})(QuickResponsesPaywallView)
