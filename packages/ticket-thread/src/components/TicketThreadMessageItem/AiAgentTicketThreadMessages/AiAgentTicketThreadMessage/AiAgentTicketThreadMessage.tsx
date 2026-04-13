import { AIThinking, Box } from '@gorgias/axiom'

import type { TicketThreadAiAgentMessageItem } from '../../../../hooks/messages/types'
import { useTicketThreadLegacyBridge } from '../../../../utils/LegacyBridge'
import { MessageAttachments } from '../../../MessageBubble/components/MessageAttachments'
import { MessageBody } from '../../../MessageBubble/components/MessageBody'
import { MessageErrors } from '../../../MessageBubble/components/MessageErrors'
import { MessageHeaderContainer } from '../../../MessageBubble/components/MessageHeader/Layout'
import { MessageChannel } from '../../../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '../../../MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageSender } from '../../../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../../../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../../../MessageBubble/MessageBubble'
import { TicketMessageActions } from '../../../TicketMessageActions/TicketMessageActions'
import { SmartFollowUps } from './SmartFollowUps'
import { useSmartFollowUps } from './useSmartFollowUps'

type AiAgentTicketThreadMessageProps = {
    item: TicketThreadAiAgentMessageItem
}

export function AiAgentTicketThreadMessage({
    item,
}: AiAgentTicketThreadMessageProps) {
    const { renderAiAgentReasoning } = useTicketThreadLegacyBridge()
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
        <MessageBubble variant="ai-agent">
            <MessageHeaderContainer>
                <Box alignItems="center" gap="xs">
                    <AIThinking variant="static" />
                    <MessageSender sender={{ name: 'AI Agent' }} />
                </Box>
                <Box alignItems="center" gap="xs">
                    <MessageChannel
                        channel={item.data.channel}
                        createdDatetime={item.data.created_datetime}
                    />
                    <MessageDeliveryIcon item={item} />
                    <MessageTimestamp
                        createdDatetime={item.data.created_datetime}
                    />
                </Box>
            </MessageHeaderContainer>
            {shouldRenderMessageContent && <MessageBody item={item} />}
            {shouldRenderSmartFollowUps && (
                <SmartFollowUps
                    selectedSmartFollowUpIndex={selectedSmartFollowUpIndex}
                    showAllSmartFollowUps={showAllSmartFollowUps}
                    smartFollowUps={smartFollowUps}
                />
            )}
            <MessageAttachments item={item} />
            <TicketMessageActions message={item.data} />
            {item.data.ticket_id && (
                <MessageErrors
                    message={item.data}
                    ticketId={item.data.ticket_id}
                />
            )}
            {renderAiAgentReasoning?.({ message: item.data })}
        </MessageBubble>
    )
}
