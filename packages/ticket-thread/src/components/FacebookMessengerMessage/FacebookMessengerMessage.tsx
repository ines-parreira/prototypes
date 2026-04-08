import { Box } from '@gorgias/axiom'

import type { TicketThreadSocialMediaFacebookMessageItem } from '../../hooks/messages/types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { OriginalCommentContext } from '../SocialMessageBubble/OriginalCommentContext'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'

type FacebookMessengerMessageProps = {
    item: TicketThreadSocialMediaFacebookMessageItem
}

export function FacebookMessengerMessage({
    item,
}: FacebookMessengerMessageProps) {
    const channelFrom = item.data.source.from?.name ?? null
    const channelTo = item.data.source.to?.[0]?.name ?? null
    const meta = item.data.meta as any
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
                justifyContent={
                    item.data.from_agent ? 'flex-end' : 'flex-start'
                }
                width="100%"
            >
                <SocialMessageBubble
                    item={item}
                    channelName="Facebook Messenger"
                    channelFrom={channelFrom}
                    channelTo={channelTo}
                    failedMessageError="We couldn't deliver your direct message"
                >
                    <MessageBody item={item} />
                    <TicketMessageActions message={item.data} />
                </SocialMessageBubble>
            </Box>
        </Box>
    )
}
