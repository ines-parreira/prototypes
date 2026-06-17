import { Box } from '@gorgias/axiom'

import { MessageBody } from '#ticket-messages/components/MessageBubble/components/MessageBody'
import { MessageFooter } from '#ticket-messages/components/MessageBubble/components/MessageFooter'
import { OriginalCommentContext } from '#ticket-messages/components/SocialMessageBubble/OriginalCommentContext'
import { SocialMessageBubble } from '#ticket-messages/components/SocialMessageBubble/SocialMessageBubble'
import { useDisplayedTicketMessage } from '#ticket-messages/components/TicketMessage/hooks/useDisplayedTicketMessage'
import { TicketMessageActions } from '#ticket-messages/components/TicketMessageActions/TicketMessageActions'
import type { TicketThreadSocialMediaInstagramDirectMessageItem } from '#ticket-messages/types'
import { getSocialChannelIcon } from '#ticket-messages/utils/getSocialChannelIcon'

type InstagramDirectMessageProps = {
    item: TicketThreadSocialMediaInstagramDirectMessageItem
}

export function InstagramDirectMessage({ item }: InstagramDirectMessageProps) {
    const displayedItem = useDisplayedTicketMessage({ item })
    const channelFrom = item.data.source?.from?.name ?? null
    const channelTo = item.data.source?.to?.[0]?.name ?? null
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
                    item={displayedItem}
                    channelIcon={
                        getSocialChannelIcon(item._tag) ?? 'comm-instagram'
                    }
                    channelName="Instagram Direct Message"
                    channelFrom={channelFrom}
                    channelTo={channelTo}
                    failedMessageError="We couldn't deliver your direct message"
                >
                    <MessageBody item={displayedItem} />
                    <MessageFooter item={displayedItem} />
                    <TicketMessageActions message={displayedItem.data} />
                </SocialMessageBubble>
            </Box>
        </Box>
    )
}
