import { useState } from 'react'

import { Tooltip } from 'reactstrap'

import { Button } from '@gorgias/axiom'
import { JourneyTypeEnum } from '@gorgias/convert-client'

import { useAIJourneyContext } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { useCoreContext } from 'pages/aiAgent/PlaygroundV2/contexts/CoreContext'
import { useAiJourneyMessages } from 'pages/aiAgent/PlaygroundV2/hooks/useAiJourneyMessages'

import { PlaygroundInitialContent } from '../PlaygroundInitialContent/PlaygroundInitialContent'
import { PlaygroundMessageList } from '../PlaygroundMessageList/PlaygroundMessageList'
import type { BaseContentViewProps } from './ContentView'

// TODO: extract the style into a dedicated file
import css from './OutboundContentView.less'

type OutboundContentViewProps = BaseContentViewProps

export const OutboundContentView = ({
    accountId,
    userId,
    onGuidanceClick,
    shouldDisplayReasoning,
    messages,
}: OutboundContentViewProps) => {
    const [tooltipOpen, setTooltipOpen] = useState(false)
    const { isPolling } = useCoreContext()
    const { triggerMessage, isTriggeringMessage } = useAiJourneyMessages()

    const {
        followUpMessagesSent,
        aiJourneySettings: { totalFollowUp },
        currentJourney,
    } = useAIJourneyContext()

    const isCampaign = currentJourney?.type === JourneyTypeEnum.Campaign

    const followUpLimitReached = followUpMessagesSent >= totalFollowUp + 1

    const toggleTooltip = () => setTooltipOpen(!tooltipOpen)

    return (
        <>
            {messages.length > 0 && (
                <div className={css.messageListContainer}>
                    <PlaygroundMessageList
                        accountId={accountId}
                        userId={userId}
                        messages={messages}
                        onGuidanceClick={onGuidanceClick}
                        shouldDisplayReasoning={shouldDisplayReasoning}
                    />
                    {!isCampaign && (
                        <div>
                            {
                                <Button
                                    id="follow-up-button"
                                    isDisabled={
                                        isPolling || followUpLimitReached
                                    }
                                    variant="secondary"
                                    onClick={triggerMessage}
                                    isLoading={isTriggeringMessage}
                                >
                                    View follow-up message
                                </Button>
                            }
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
                    )}
                </div>
            )}
            {messages.length === 0 && (
                <div className={css.initialContentContainer}>
                    <PlaygroundInitialContent
                        onStartClick={triggerMessage}
                        isLoading={isTriggeringMessage}
                    />
                </div>
            )}
        </>
    )
}
