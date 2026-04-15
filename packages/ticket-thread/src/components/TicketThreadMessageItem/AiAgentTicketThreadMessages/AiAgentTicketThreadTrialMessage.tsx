import { AIThinking, Box, Icon, Text } from '@gorgias/axiom'

import type { TicketThreadAiAgentTrialMessageItem } from '../../../hooks/messages/types'
import { useTicketThreadLegacyBridge } from '../../../utils/LegacyBridge'
import { MessageErrors } from '../../MessageBubble/components/MessageErrors'
import { MessageHeaderContainer } from '../../MessageBubble/components/MessageHeader/Layout'
import { MessageSender } from '../../MessageBubble/components/MessageHeader/MessageSender'
import { MessageBubble } from '../../MessageBubble/MessageBubble'
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
