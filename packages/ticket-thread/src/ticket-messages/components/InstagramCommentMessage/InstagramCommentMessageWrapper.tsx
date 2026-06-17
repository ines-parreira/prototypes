import { Box } from '@gorgias/axiom'

import { useTicketThreadLegacyBridge } from '#legacy-bridge/useTicketThreadLegacyBridge'
import { RespondedByDMBubble } from '#ticket-messages/components/SocialMessageBubble/RespondedByDMBubble'
import { TicketMessageActions } from '#ticket-messages/components/TicketMessageActions/TicketMessageActions'
import { isSocialMediaHiddenComment } from '#ticket-messages/predicates'
import type { TicketThreadSocialMediaInstagramCommentItem } from '#ticket-messages/types'
import { InstagramCommentMessage } from './InstagramCommentMessage'
import { InstagramCommentMessageActions } from './InstagramCommentMessageActions'

type InstagramCommentMessageWrapperProps = {
    item: TicketThreadSocialMediaInstagramCommentItem
}

export function InstagramCommentMessageWrapper({
    item,
}: InstagramCommentMessageWrapperProps) {
    const { onInstagramCommentPrivateReply, onInstagramCommentHideComment } =
        useTicketThreadLegacyBridge()
    const isHidden = isSocialMediaHiddenComment(item.data)
    const commentBody = item.data.body_text || ''
    const meta = item.data.meta as any
    const repliedBy = meta?.replied_by as
        | { ticket_id: number; ticket_message_id: number }
        | undefined

    const handleHideComment = () => {
        onInstagramCommentHideComment({
            integrationId: item.data.integration_id,
            messageId: item.data.message_id,
            ticketId: item.data.ticket_id,
            shouldHide: !isHidden,
        })
    }

    const handlePrivateReply = () => {
        onInstagramCommentPrivateReply({
            integrationId: item.data.integration_id,
            messageId: item.data.message_id,
            ticketMessageId: item.data.id,
            ticketId: item.data.ticket_id,
            senderId: item.data.sender.id,
            commentMessage: commentBody,
            source: item.data.source,
            sender: item.data.sender,
            meta: item.data.meta,
            messageCreatedDatetime: item.data.created_datetime,
        })
    }

    return (
        <Box display="flex" flexDirection="column" width="100%" gap="xs">
            <Box
                display="flex"
                justifyContent={
                    item.data.from_agent ? 'flex-end' : 'flex-start'
                }
                width="100%"
            >
                <InstagramCommentMessage
                    item={item}
                    actions={
                        item.data.from_agent ? (
                            <TicketMessageActions message={item.data} />
                        ) : (
                            <InstagramCommentMessageActions
                                message={item.data}
                                isHidden={isHidden}
                                onPrivateReply={handlePrivateReply}
                                onHideComment={handleHideComment}
                            />
                        )
                    }
                    onUnhide={isHidden ? handleHideComment : undefined}
                />
            </Box>
            {repliedBy && (
                <Box
                    display="flex"
                    justifyContent="flex-end"
                    width="100%"
                    data-responded-by-dm
                >
                    <RespondedByDMBubble
                        channel="Instagram Direct Message"
                        channelIcon="channel-instagram-dm"
                        ticketId={repliedBy.ticket_id}
                        ticketMessageId={repliedBy.ticket_message_id}
                    />
                </Box>
            )}
        </Box>
    )
}
