import { AIThinking, Box } from '@gorgias/axiom'

import type { TicketThreadAiAgentDraftMessageItem } from '../../../hooks/messages/types'
import { useTicketThreadLegacyBridge } from '../../../utils/LegacyBridge'
import { MessageErrors } from '../../MessageBubble/components/MessageErrors'
import { MessageHeaderContainer } from '../../MessageBubble/components/MessageHeader/Layout'
import { MessageChannel } from '../../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '../../MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageSender } from '../../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../../MessageBubble/MessageBubble'

type AiAgentTicketThreadDraftMessageProps = {
    item: TicketThreadAiAgentDraftMessageItem
}

export function AiAgentTicketThreadDraftMessage({
    item,
}: AiAgentTicketThreadDraftMessageProps) {
    const { renderAiAgentDraftMessage } = useTicketThreadLegacyBridge()

    return (
        <MessageBubble variant="internal-note">
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
            {renderAiAgentDraftMessage?.({
                message: item.data,
                isTrial: false,
            })}
            {item.data.ticket_id && (
                <MessageErrors
                    message={item.data}
                    ticketId={item.data.ticket_id}
                />
            )}
        </MessageBubble>
    )
}
