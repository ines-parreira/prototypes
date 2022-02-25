import React, {useState} from 'react'
import {useSelector} from 'react-redux'

import Paywall from 'pages/common/components/Paywall/Paywall'
import UpgradeButton from 'pages/common/components/UpgradeButton'
import AutomationSubscriptionModal from 'pages/settings/billing/automation/AutomationSubscriptionModal'
import {DEPRECATED_getCurrentPlan} from 'state/billing/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {CurrentAccountState} from 'state/currentAccount/types'
import {RootState} from 'state/types'
import {SegmentEvent} from 'store/middlewares/segmentTracker'
import {getIconFromUrl} from 'utils'

const sspAutomationAddonMock = getIconFromUrl(
    'paywalls/screens/gorgias_chat_ssp_automation.png'
)

export const GorgiasChatIntegrationSelfServicePaywall = () => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const account = useSelector<RootState, CurrentAccountState>(
        getCurrentAccountState
    )
    const currentPlan = useSelector(DEPRECATED_getCurrentPlan)

    const segmentEventToSend = {
        name: SegmentEvent.PaywallUpgradeButtonSelected,
        props: {
            domain: account.get('domain'),
            current_plan: currentPlan.get('id'),
            paywall_feature: 'automation_addon',
        },
    }

    return (
        <Paywall
            requiredUpgrade="Automation"
            header="Leverage the power of Self-service"
            description={
                <>
                    Let your customers <b>track their orders on their own</b>,
                    request to <b>cancel</b> or <b>return</b> them and{' '}
                    <b>tell you more</b> about them at their convenience. <br />
                </>
            }
            previewImage={sspAutomationAddonMock}
            renderFilterShadow
            customCta={
                <UpgradeButton
                    label="Get Automation Features"
                    onClick={() => {
                        setIsAutomationModalOpened(true)
                    }}
                    segmentEventToSend={segmentEventToSend}
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
