import { AIThinking, Box } from '@gorgias/axiom'

import type { TicketThreadAiAgentHandoverMessageItem } from '../../../hooks/messages/types'
import { useTicketThreadLegacyBridge } from '../../../utils/LegacyBridge'
import { MessageBody } from '../../MessageBubble/components/MessageBody'
import { MessageHeaderContainer } from '../../MessageBubble/components/MessageHeader/Layout'
import { MessageSender } from '../../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../../MessageBubble/MessageBubble'
import { getAiAgentDisplayName } from './getAiAgentDisplayName'

type AiAgentHandoverSummaryMessageProps = {
    item: TicketThreadAiAgentHandoverMessageItem
}

export function AiAgentHandoverSummaryMessage({
    item,
}: AiAgentHandoverSummaryMessageProps) {
    const { renderAiAgentHandoverSummary, renderAiAgentReasoning } =
        useTicketThreadLegacyBridge()
    const summaryContent = renderAiAgentHandoverSummary?.({
        message: item.data,
    })
    const aiAgentName = getAiAgentDisplayName(item.data.sender.name)

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
                        <MessageTimestamp
                            createdDatetime={item.data.created_datetime}
                        />
                    </Box>
                </MessageHeaderContainer>
                <MessageBody item={item} />
                {renderAiAgentReasoning?.({ message: item.data })}
            </MessageBubble>
            {summaryContent}
        </Box>
    )
}
