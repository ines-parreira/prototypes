import React, { useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { TicketChannel } from 'business/types/ticket'
import { logEvent, SegmentEvent } from 'common/segment'
import useAppSelector from 'hooks/useAppSelector'
import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'
import { getHasAutomate } from 'state/billing/selectors'

import css from './GorgiasChatIntegrationConnectedChannel.less'

const GorgiasChatIntegrationConnectedChannel = () => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const hasAutomate = useAppSelector(getHasAutomate)

    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]

    const logChatEvent = (version: string) => {
        if (!changeAutomateSettingButtomPosition) return
        logEvent(SegmentEvent.AutomateSettingButtonClicked, {
            channel: TicketChannel.Chat,
            version,
        })
    }

    if (!hasAutomate) {
        return (
            <>
                <AutomateSubscriptionButton
                    className={css.automationSubscriptionButton}
                    fillStyle="ghost"
                    label={
                        changeAutomateSettingButtomPosition
                            ? 'Upgrade to AI Agent'
                            : 'Upgrade your chat with AI Agent'
                    }
                    onClick={() => {
                        logChatEvent('Upsell')
                        setIsAutomationModalOpened(true)
                    }}
                />
                <AutomateSubscriptionModal
                    confirmLabel="Subscribe"
                    isOpen={isAutomationModalOpened}
                    onClose={() => {
                        setIsAutomationModalOpened(false)
                    }}
                />
            </>
        )
    }

    return null
}

export default GorgiasChatIntegrationConnectedChannel
