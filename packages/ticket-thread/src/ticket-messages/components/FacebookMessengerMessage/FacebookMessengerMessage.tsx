import { Box } from '@gorgias/axiom'

import type { TicketThreadSocialMediaFacebookMessageItem } from '../../types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { OriginalCommentContext } from '../SocialMessageBubble/OriginalCommentContext'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { useDisplayedTicketMessage } from '../TicketMessage/hooks/useDisplayedTicketMessage'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'

type FacebookMessengerMessageProps = {
    item: TicketThreadSocialMediaFacebookMessageItem
}

export function FacebookMessengerMessage({
    item,
}: FacebookMessengerMessageProps) {
    const displayedItem = useDisplayedTicketMessage({ item })
    const message = displayedItem.data
    const channelFrom = message.source.from?.name ?? null
    const channelTo = message.source.to?.[0]?.name ?? null
    const meta = message.meta as any
    const repliedTo = meta?.replied_to as
        | { ticket_id: number; ticket_message_id: number }
        | undefined

    return (
        <Box display="flex" flexDirection="column" width="100%" gap="xs">
            {repliedTo && (
                <Box
                    display="flex"
                    justifyContent="flex-start"
                    width="100%"
                    data-original-comment-context
                >
                    <OriginalCommentContext
                        ticketId={repliedTo.ticket_id}
                        ticketMessageId={repliedTo.ticket_message_id}
                    />
                </Box>
            )}
            <Box
                display="flex"
                justifyContent={message.from_agent ? 'flex-end' : 'flex-start'}
                width="100%"
            >
                <SocialMessageBubble
                    item={displayedItem}
                    channelName="Facebook Messenger"
                    channelFrom={channelFrom}
                    channelTo={channelTo}
                    failedMessageError="We couldn't deliver your direct message"
                >
                    <MessageBody item={displayedItem} />
                    <MessageFooter item={displayedItem} />
                    <TicketMessageActions message={message} />
                </SocialMessageBubble>
            </Box>
        </Box>
    )
}
