import { useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'

import { TicketChannel } from 'business/types/ticket'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import AutomateSubscriptionButton from 'pages/settings/billing/automate/AutomateSubscriptionButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'

import css from './GorgiasChatIntegrationConnectedChannel.less'

const GorgiasChatIntegrationConnectedChannel = () => {
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    const { hasAccess } = useAiAgentAccess()

    const changeAutomateSettingButtomPosition = useFlag(
        FeatureFlagKey.ChangeAutomateSettingButtomPosition,
    )

    const logChatEvent = (version: string) => {
        if (!changeAutomateSettingButtomPosition) return
        logEvent(SegmentEvent.AutomateSettingButtonClicked, {
            channel: TicketChannel.Chat,
            version,
        })
    }

    if (!hasAccess) {
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
