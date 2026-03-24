import { AIThinking, Box } from '@gorgias/axiom'

import type { TicketThreadAiAgentMessageItem } from '../../../../hooks/messages/types'
import { MessageAttachments } from '../../../MessageBubble/components/MessageAttachments'
import { MessageBody } from '../../../MessageBubble/components/MessageBody'
import { MessageHeaderContainer } from '../../../MessageBubble/components/MessageHeader/Layout'
import { MessageChannel } from '../../../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '../../../MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageSender } from '../../../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../../../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../../../MessageBubble/MessageBubble'

type AiAgentTicketThreadMessageProps = {
    item: TicketThreadAiAgentMessageItem
}

export function AiAgentTicketThreadMessage({
    item,
}: AiAgentTicketThreadMessageProps) {
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
            <MessageBody item={item} />
            <MessageAttachments item={item} />
        </MessageBubble>
    )
}
