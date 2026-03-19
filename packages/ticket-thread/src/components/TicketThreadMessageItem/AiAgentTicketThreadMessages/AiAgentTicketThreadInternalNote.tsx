import { Box } from '@gorgias/axiom'

import type { TicketThreadAiAgentInternalNoteItem } from '../../../hooks/messages/types'
import { MessageBody } from '../../MessageBubble/components/MessageBody'
import { MessageHeaderContainer } from '../../MessageBubble/components/MessageHeader/Layout'
import { MessageChannel } from '../../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '../../MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageSender } from '../../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../../MessageBubble/MessageBubble'

type AiAgentTicketThreadInternalNoteProps = {
    item: TicketThreadAiAgentInternalNoteItem
}

export function AiAgentTicketThreadInternalNote({
    item,
}: AiAgentTicketThreadInternalNoteProps) {
    return (
        <MessageBubble variant="internal-note">
            <MessageHeaderContainer>
                <Box alignItems="center" gap="xs">
                    <div>AI agent image</div>
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
        </MessageBubble>
    )
}
