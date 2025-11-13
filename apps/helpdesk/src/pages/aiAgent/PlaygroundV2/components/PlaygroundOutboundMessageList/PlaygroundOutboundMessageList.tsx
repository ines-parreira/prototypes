import { ReactNode, useState } from 'react'

import { Tooltip } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import { SmsChannelMessagesContainer } from 'pages/aiAgent/PlaygroundV2/components/SmsChannelMessagesContainer/SmsChannelMessagesContainer'
import { useAIJourneyContext } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { useConfigurationContext } from 'pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { useAiJourneyMessages } from 'pages/aiAgent/PlaygroundV2/hooks/useAiJourneyMessages'

import css from './PlaygroundOutboundMessageList.less'

export const PlaygroundOutboundMessageList = ({
    children,
}: {
    children: ReactNode
}) => {
    const [tooltipOpen, setTooltipOpen] = useState(false)
    const { shopName } = useConfigurationContext()
    const { isPolling } = useCoreContext()
    const { triggerMessage, isTriggeringMessage } = useAiJourneyMessages()

    const {
        followUpMessagesSent,
        aiJourneySettings: { totalFollowUp },
    } = useAIJourneyContext()

    const followUpLimitReached = followUpMessagesSent >= totalFollowUp

    const toggleTooltip = () => setTooltipOpen(!tooltipOpen)

    return (
        <div className={css.messageListContainer}>
            <SmsChannelMessagesContainer storeName={shopName}>
                {children}
            </SmsChannelMessagesContainer>
            <div>
                <Button
                    id="follow-up-button"
                    isDisabled={isPolling || followUpLimitReached}
                    variant="secondary"
                    onClick={triggerMessage}
                    isLoading={isTriggeringMessage}
                >
                    View follow-up message
                </Button>
                {followUpLimitReached && (
                    <Tooltip
                        target="follow-up-button"
                        placement="left"
                        isOpen={tooltipOpen}
                        toggle={toggleTooltip}
                    >
                        Configured follow up limit reached
                    </Tooltip>
                )}
            </div>
        </div>
    )
}
