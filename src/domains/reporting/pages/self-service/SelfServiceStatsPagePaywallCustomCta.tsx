import React, { useState } from 'react'

import { SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'
import { getCurrentPlansByProduct } from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { CurrentAccountState } from 'state/currentAccount/types'

const SelfServiceStatsPagePaywallCustomCta = () => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const account = useAppSelector<CurrentAccountState>(getCurrentAccountState)
    const currentProducts = useAppSelector(getCurrentPlansByProduct)

    const segmentEventToSend = {
        name: SegmentEvent.PaywallUpgradeButtonSelected,
        props: {
            domain: account.get('domain'),
            current_prices: Object.values(currentProducts || {})?.map(
                (product) => product.price_id,
            ),
            paywall_feature: 'automation_addon',
        },
    }

    return (
        <>
            <AutomateSubscriptionButton
                onClick={() => {
                    setIsAutomationModalOpened(true)
                }}
                hasIcon={false}
                label="Learn More"
                segmentEventToSend={segmentEventToSend}
            />
            <AutomateSubscriptionModal
                confirmLabel="Subscribe"
                isOpen={isAutomationModalOpened}
                onClose={() => setIsAutomationModalOpened(false)}
            />
        </>
    )
}

export default SelfServiceStatsPagePaywallCustomCta
