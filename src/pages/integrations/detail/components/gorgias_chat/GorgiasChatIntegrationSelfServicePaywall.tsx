import React, {useState} from 'react'
import {useSelector} from 'react-redux'

import AutomationSubscriptionModal from '../../../../settings/billing/automation/AutomationSubscriptionModal'
import UpgradeButton from '../../../../common/components/UpgradeButton'
import {SegmentEvent} from '../../../../../store/middlewares/segmentTracker'
import {RootState} from '../../../../../state/types'
import {CurrentAccountState} from '../../../../../state/currentAccount/types'
import {getCurrentAccountState} from '../../../../../state/currentAccount/selectors'
import {DEPRECATED_getCurrentPlan} from '../../../../../state/billing/selectors'
import {getIconFromUrl} from '../../../../../utils'
import Paywall from '../../../../common/components/Paywall/Paywall'

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
