import React, {useState} from 'react'

import Paywall, {UpgradeType} from 'pages/common/components/Paywall/Paywall'
import {withCanduPaywall} from 'pages/common/components/Paywall/CanduPaywall'
import AutomationSubscriptionButton from 'pages/settings/billing/automate/AutomationSubscriptionButton'
import AutomationSubscriptionModal from 'pages/settings/billing/automate/AutomationSubscriptionModal'
import {assetsUrl} from 'utils'
import {FLOWS} from '../common/components/constants'

const WorkflowsPaywallView = () => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)

    return (
        <Paywall
            pageHeader={FLOWS}
            header="Automate multi-step interactions with flows"
            description="Help customers select products, answer support questions, and more with flows!"
            previewImage={assetsUrl('/img/paywalls/screens/workflows.png')}
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
    title: FLOWS,
    canduId: 'flows-paywall',
})(WorkflowsPaywallView)
