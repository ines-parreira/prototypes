import { AIThinking, Box } from '@gorgias/axiom'

import type { TicketThreadAiAgentHandoverMessageItem } from '../../../hooks/messages/types'
import { useTicketThreadLegacyBridge } from '../../../utils/LegacyBridge'
import { MessageBody } from '../../MessageBubble/components/MessageBody'
import { MessageFooter } from '../../MessageBubble/components/MessageFooter'
import { MessageHeaderContainer } from '../../MessageBubble/components/MessageHeader/Layout'
import { MessageSender } from '../../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../../MessageBubble/MessageBubble'
import { useDisplayedTicketMessage } from '../../TicketMessage/hooks/useDisplayedTicketMessage'
import { TicketMessageActions } from '../../TicketMessageActions/TicketMessageActions'
import { getAiAgentDisplayName } from './getAiAgentDisplayName'

import css from '../../MessageBubble/MessageBubble.less'

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
