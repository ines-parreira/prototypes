import { Box } from '@gorgias/axiom'

import type { TicketThreadSocialMediaInstagramDirectMessageItem } from '../../hooks/messages/types'
import { getSocialChannelIcon } from '../../utils/getSocialChannelIcon'
import { MessageAttachments } from '../MessageBubble/components/MessageAttachments'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { OriginalCommentContext } from '../SocialMessageBubble/OriginalCommentContext'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'

type InstagramDirectMessageProps = {
    item: TicketThreadSocialMediaInstagramDirectMessageItem
}

export function InstagramDirectMessage({ item }: InstagramDirectMessageProps) {
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
                    item={item}
                    channelIcon={
                        getSocialChannelIcon(item._tag) ?? 'comm-instagram'
                    }
                    channelName="Instagram Direct Message"
                    channelFrom={channelFrom}
                    channelTo={channelTo}
                    failedMessageError="We couldn't deliver your direct message"
                >
                    <MessageBody item={item} />
                    <MessageAttachments item={item} />
                    <TicketMessageActions message={item.data} />
                </SocialMessageBubble>
            </Box>
        </Box>
    )
}
