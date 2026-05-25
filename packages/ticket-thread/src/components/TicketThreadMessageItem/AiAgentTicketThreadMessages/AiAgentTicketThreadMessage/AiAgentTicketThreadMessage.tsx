import { AIThinking, Box } from '@gorgias/axiom'

import type { TicketThreadAiAgentMessageItem } from '../../../../hooks/messages/types'
import { useTicketThreadLegacyBridge } from '../../../../utils/LegacyBridge'
import { MessageBody } from '../../../MessageBubble/components/MessageBody'
import { MessageErrors } from '../../../MessageBubble/components/MessageErrors'
import { MessageFooter } from '../../../MessageBubble/components/MessageFooter'
import { getMessageChannelParticipants } from '../../../MessageBubble/components/MessageHeader/getMessageChannelParticipants'
import { MessageHeaderContainer } from '../../../MessageBubble/components/MessageHeader/Layout'
import { MessageChannel } from '../../../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '../../../MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageMeta } from '../../../MessageBubble/components/MessageHeader/MessageMeta'
import { MessageSender } from '../../../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../../../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../../../MessageBubble/MessageBubble'
import { useDisplayedTicketMessage } from '../../../TicketMessage/hooks/useDisplayedTicketMessage'
import { TicketMessageActions } from '../../../TicketMessageActions/TicketMessageActions'
import { AiAgentTicketThreadPseudoEvent } from '../AiAgentTicketThreadPseudoEvent'
import { getAiAgentDisplayName } from '../getAiAgentDisplayName'
import { SmartFollowUps } from './SmartFollowUps'
import { useSmartFollowUps } from './useSmartFollowUps'

type AiAgentTicketThreadMessageProps = {
    item: TicketThreadAiAgentMessageItem
}

export function AiAgentTicketThreadMessage({
    item,
}: AiAgentTicketThreadMessageProps) {
    const displayedItem = useDisplayedTicketMessage({ item })
    const { renderAiAgentReasoning } = useTicketThreadLegacyBridge()
    const aiAgentName = getAiAgentDisplayName(item.data.sender.name)
    const { from, to, cc, bcc } = getMessageChannelParticipants(
        item.data.source,
    )
    const {
        selectedSmartFollowUpIndex,
        showAllSmartFollowUps,
        shouldRenderMessageContent,
        shouldRenderSmartFollowUps,
        smartFollowUps,
    } = useSmartFollowUps({
        ticketMessageMetadata: item.data.meta,
    })

    return (
        <Box
            width="100%"
            flexDirection="column"
            alignItems="flex-end"
            gap="xxs"
        >
            <MessageBubble variant="ai-agent">
                <MessageHeaderContainer>
                    <Box alignItems="center" gap="xs">
                        <AIThinking variant="static" />
                        <MessageSender sender={{ name: aiAgentName }} />
                    </Box>
                    <Box alignItems="center" gap="xs">
                        <MessageChannel
                            channel={item.data.channel}
                            createdDatetime={item.data.created_datetime}
                            from={from}
                            to={to}
                            cc={cc}
                            bcc={bcc}
                        />
                        <MessageDeliveryIcon item={item} />
                        <MessageTimestamp
                            createdDatetime={item.data.created_datetime}
                        />
                    </Box>
                </MessageHeaderContainer>
                <MessageMeta
                    meta={item.data.meta}
                    messageId={item.data.message_id}
                    source={item.data.source}
                    integrationId={item.data.integration_id}
                />
                {shouldRenderMessageContent && (
                    <MessageBody item={displayedItem} />
                )}
                {shouldRenderSmartFollowUps && (
                    <SmartFollowUps
                        selectedSmartFollowUpIndex={selectedSmartFollowUpIndex}
                        showAllSmartFollowUps={showAllSmartFollowUps}
                        smartFollowUps={smartFollowUps}
                    />
                )}
                <MessageFooter item={displayedItem} />
                <TicketMessageActions message={item.data} />
                {item.data.ticket_id && (
                    <MessageErrors
                        message={item.data}
                        ticketId={item.data.ticket_id}
                    />
                )}
                {renderAiAgentReasoning?.({ message: item.data })}
            </MessageBubble>
            <AiAgentTicketThreadPseudoEvent
                agentName={aiAgentName}
                pseudoEvent={item.data.decorations?.aiAgentPseudoEvent}
            />
        </Box>
    )
}
