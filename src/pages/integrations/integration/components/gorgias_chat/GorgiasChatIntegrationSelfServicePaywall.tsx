import React, {useState} from 'react'

import Paywall, {UpgradeType} from 'pages/common/components/Paywall/Paywall'
import UpgradeButton from 'pages/common/components/UpgradeButton'
import AutomationSubscriptionModal from 'pages/settings/billing/automation/AutomationSubscriptionModal'
import {getCurrentPlan} from 'state/billing/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {CurrentAccountState} from 'state/currentAccount/types'
import {SegmentEvent} from 'store/middlewares/segmentTracker'
import {getIconFromUrl} from 'utils'
import useAppSelector from 'hooks/useAppSelector'
import {PlanName} from 'utils/paywalls'

const sspAutomationAddonMock = getIconFromUrl(
    'paywalls/screens/gorgias_chat_ssp_automation.png'
)

export const GorgiasChatIntegrationSelfServicePaywall = () => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const account = useAppSelector<CurrentAccountState>(getCurrentAccountState)
    const currentPlan = useAppSelector(getCurrentPlan)

    const segmentEventToSend = {
        name: SegmentEvent.PaywallUpgradeButtonSelected,
        props: {
            domain: account.get('domain'),
            current_plan: currentPlan?.id,
            paywall_feature: 'automation_addon',
        },
    }

    return (
        <Paywall
            requiredUpgrade="Automation"
            header="Get advanced automation features"
            description={
                <>
                    Empower customers to manage their orders, find
                    <br />
                    answers to common questions and receive help center <br />
                    article recommendations based on their questions.
                </>
            }
            previewImage={sspAutomationAddonMock}
            renderFilterShadow
            customCta={
                !currentPlan?.automation_addon_equivalent_plan ? (
                    <UpgradeButton
                        state={{
                            openedPlanModal: PlanName.Basic,
                            isAutomationAddOnChecked: true,
                        }}
                        segmentEventToSend={segmentEventToSend}
                        position="left"
                    />
                ) : (
                    <UpgradeButton
                        label="Add Automation Features"
                        onClick={() => {
                            setIsAutomationModalOpened(true)
                        }}
                        segmentEventToSend={segmentEventToSend}
                        position="left"
                    />
                )
            }
            modal={
                <AutomationSubscriptionModal
                    confirmLabel="Confirm"
                    isOpen={isAutomationModalOpened}
                    onClose={() => setIsAutomationModalOpened(false)}
                />
            }
            upgradeType={UpgradeType.AddOn}
        />
    )
}
