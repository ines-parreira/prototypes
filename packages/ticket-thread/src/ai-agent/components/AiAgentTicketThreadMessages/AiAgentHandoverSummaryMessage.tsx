import { AIThinking, Box } from '@gorgias/axiom'

import { useTicketThreadLegacyBridge } from '#legacy-bridge'
import { MessageBody } from '#ticket-messages/components/MessageBubble/components/MessageBody'
import { MessageFooter } from '#ticket-messages/components/MessageBubble/components/MessageFooter'
import { MessageHeaderContainer } from '#ticket-messages/components/MessageBubble/components/MessageHeader/Layout'
import { MessageSender } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '#ticket-messages/components/MessageBubble/MessageBubble'
import { useDisplayedTicketMessage } from '#ticket-messages/components/TicketMessage/hooks/useDisplayedTicketMessage'
import { TicketMessageActions } from '#ticket-messages/components/TicketMessageActions/TicketMessageActions'
import type { TicketThreadAiAgentHandoverMessageItem } from '#ticket-messages/types'
import { getAiAgentDisplayName } from './getAiAgentDisplayName'

import css from '../../../ticket-messages/components/MessageBubble/MessageBubble.less'

type AiAgentHandoverSummaryMessageProps = {
    item: TicketThreadAiAgentHandoverMessageItem
}

export function AiAgentHandoverSummaryMessage({
    item,
}: AiAgentHandoverSummaryMessageProps) {
    const displayedItem = useDisplayedTicketMessage({ item })
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
            <div className={css.bubbleRow}>
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
                    <MessageBody item={displayedItem} />
                    <MessageFooter item={displayedItem} />
                    <TicketMessageActions message={item.data} />
                    {renderAiAgentReasoning?.({ message: item.data })}
                </MessageBubble>
            </div>
            {summaryContent && (
                <div className={css.bubbleRow}>{summaryContent}</div>
            )}
        </Box>
    )
}
