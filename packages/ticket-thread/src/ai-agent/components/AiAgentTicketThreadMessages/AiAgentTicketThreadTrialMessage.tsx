import { AIThinking, Box, Icon, Text } from '@gorgias/axiom'

import { useTicketThreadLegacyBridge } from '#legacy-bridge'
import { MessageErrors } from '#ticket-messages/components/MessageBubble/components/MessageErrors'
import { MessageHeaderContainer } from '#ticket-messages/components/MessageBubble/components/MessageHeader/Layout'
import { MessageSender } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageSender'
import { MessageBubble } from '#ticket-messages/components/MessageBubble/MessageBubble'
import type { TicketThreadAiAgentTrialMessageItem } from '#ticket-messages/types'
import { getAiAgentDisplayName } from './getAiAgentDisplayName'

type AiAgentTicketThreadTrialMessageProps = {
    item: TicketThreadAiAgentTrialMessageItem
}

export function AiAgentTicketThreadTrialMessage({
    item,
}: AiAgentTicketThreadTrialMessageProps) {
    const { renderAiAgentTrialMessage } = useTicketThreadLegacyBridge()
    const aiAgentName = getAiAgentDisplayName(item.data.sender.name)

    return (
        <MessageBubble variant="from-agent">
            <MessageHeaderContainer>
                <Box alignItems="center" gap="xs">
                    <AIThinking variant="static" />
                    <MessageSender sender={{ name: aiAgentName }} />
                </Box>
                <Box alignItems="center" gap="xs">
                    <Icon
                        name="hide"
                        size="sm"
                        color="content-neutral-secondary"
                    />
                    <Text size="sm" color="content-neutral-secondary">
                        Preview message, only visible to you
                    </Text>
                </Box>
            </MessageHeaderContainer>
            {renderAiAgentTrialMessage?.({
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
