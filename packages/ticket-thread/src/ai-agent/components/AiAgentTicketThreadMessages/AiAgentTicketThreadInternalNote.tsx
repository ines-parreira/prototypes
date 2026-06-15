import { AIThinking, Box } from '@gorgias/axiom'

import { useTicketThreadLegacyBridge } from '../../../legacy-bridge'
import { MessageBody } from '../../../ticket-messages/components/MessageBubble/components/MessageBody'
import { MessageErrors } from '../../../ticket-messages/components/MessageBubble/components/MessageErrors'
import { MessageHeaderContainer } from '../../../ticket-messages/components/MessageBubble/components/MessageHeader/Layout'
import { MessageChannel } from '../../../ticket-messages/components/MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '../../../ticket-messages/components/MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageSender } from '../../../ticket-messages/components/MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../../../ticket-messages/components/MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../../../ticket-messages/components/MessageBubble/MessageBubble'
import type { TicketThreadAiAgentInternalNoteItem } from '../../../ticket-messages/types'
import { AiAgentTicketThreadPseudoEvent } from './AiAgentTicketThreadPseudoEvent'
import { getAiAgentDisplayName } from './getAiAgentDisplayName'

type AiAgentTicketThreadInternalNoteProps = {
    item: TicketThreadAiAgentInternalNoteItem
}

export function AiAgentTicketThreadInternalNote({
    item,
}: AiAgentTicketThreadInternalNoteProps) {
    const { renderAiAgentReasoning } = useTicketThreadLegacyBridge()
    const aiAgentName = getAiAgentDisplayName(item.data.sender.name)

    return (
        <Box
            width="100%"
            flexDirection="column"
            alignItems="flex-end"
            gap="xxs"
        >
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
                        />
                        <MessageDeliveryIcon item={item} />
                        <MessageTimestamp
                            createdDatetime={item.data.created_datetime}
                        />
                    </Box>
                </MessageHeaderContainer>
                <MessageBody item={item} />
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
