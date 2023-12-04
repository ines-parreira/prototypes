import React, {useState} from 'react'

import Paywall, {UpgradeType} from 'pages/common/components/Paywall/Paywall'
import {withCanduPaywall} from 'pages/common/components/Paywall/CanduPaywall'
import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'
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
                <AutomateSubscriptionButton
                    onClick={() => {
                        setIsAutomationModalOpened(true)
                    }}
                    label="Get Automate Features"
                />
            }
            modal={
                <AutomateSubscriptionModal
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
