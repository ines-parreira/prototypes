import React, {useState} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {CurrentAccountState} from 'state/currentAccount/types'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getCurrentProducts} from 'state/billing/selectors'
import {SegmentEvent} from 'store/middlewares/segmentTracker'
import AutomationSubscriptionButton from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionButton'
import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'

const SelfServiceStatsPagePaywallCustomCta = () => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const account = useAppSelector<CurrentAccountState>(getCurrentAccountState)
    const currentProducts = useAppSelector(getCurrentProducts)

    const segmentEventToSend = {
        name: SegmentEvent.PaywallUpgradeButtonSelected,
        props: {
            domain: account.get('domain'),
            current_prices: Object.values(currentProducts || {})?.map(
                (product) => product.price_id
            ),
            paywall_feature: 'automation_addon',
        },
    }

    return (
        <>
            <AutomationSubscriptionButton
                onClick={() => {
                    setIsAutomationModalOpened(true)
                }}
                label="Get Automation Add-on"
                segmentEventToSend={segmentEventToSend}
            />
            <AutomationSubscriptionModal
                confirmLabel="Confirm"
                isOpen={isAutomationModalOpened}
                onClose={() => setIsAutomationModalOpened(false)}
            />
        </>
    )
}

export default SelfServiceStatsPagePaywallCustomCta
