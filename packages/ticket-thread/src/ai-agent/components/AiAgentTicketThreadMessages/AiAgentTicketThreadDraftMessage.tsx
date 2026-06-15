import { AIThinking, Box } from '@gorgias/axiom'

import { useTicketThreadLegacyBridge } from '../../../legacy-bridge'
import { MessageErrors } from '../../../ticket-messages/components/MessageBubble/components/MessageErrors'
import { getMessageChannelParticipants } from '../../../ticket-messages/components/MessageBubble/components/MessageHeader/getMessageChannelParticipants'
import { MessageHeaderContainer } from '../../../ticket-messages/components/MessageBubble/components/MessageHeader/Layout'
import { MessageChannel } from '../../../ticket-messages/components/MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '../../../ticket-messages/components/MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageSender } from '../../../ticket-messages/components/MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../../../ticket-messages/components/MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../../../ticket-messages/components/MessageBubble/MessageBubble'
import type { TicketThreadAiAgentDraftMessageItem } from '../../../ticket-messages/types'
import { getAiAgentDisplayName } from './getAiAgentDisplayName'

type AiAgentTicketThreadDraftMessageProps = {
    item: TicketThreadAiAgentDraftMessageItem
}

export function AiAgentTicketThreadDraftMessage({
    item,
}: AiAgentTicketThreadDraftMessageProps) {
    const { renderAiAgentDraftMessage } = useTicketThreadLegacyBridge()
    const aiAgentName = getAiAgentDisplayName(item.data.sender.name)
    const { from, to, cc, bcc } = getMessageChannelParticipants(
        item.data.source,
    )

    return (
        <MessageBubble variant="internal-note">
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
            {renderAiAgentDraftMessage?.({
                message: item.data,
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
