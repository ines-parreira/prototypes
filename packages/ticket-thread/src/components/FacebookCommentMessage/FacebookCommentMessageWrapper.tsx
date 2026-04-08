import { Box } from '@gorgias/axiom'

import { isSocialMediaHiddenComment } from '../../hooks/messages/predicates'
import type { TicketThreadSocialMediaFacebookCommentItem } from '../../hooks/messages/types'
import { useTicketThreadLegacyBridge } from '../../utils/LegacyBridge/useTicketThreadLegacyBridge'
import { RespondedByDMBubble } from '../SocialMessageBubble/RespondedByDMBubble'
import { FacebookCommentMessage } from './FacebookCommentMessage'
import { FacebookCommentMessageActions } from './FacebookCommentMessageActions'
import type { FacebookCommentMeta } from './types'

type FacebookCommentMessageWrapperProps = {
    item: TicketThreadSocialMediaFacebookCommentItem
}

export function FacebookCommentMessageWrapper({
    item,
}: FacebookCommentMessageWrapperProps) {
    const {
        onFacebookCommentPrivateReply,
        onFacebookCommentHideComment,
        onFacebookCommentLike,
    } = useTicketThreadLegacyBridge()
    const isHidden = isSocialMediaHiddenComment(item.data)
    const meta = item.data.meta as FacebookCommentMeta | null
    const repliedBy = meta?.replied_by
    const isLiked = Boolean(
        meta?.facebook_reactions?.page_reaction?.reaction_type,
    )

    const handleHideComment = () => {
        onFacebookCommentHideComment({
            integrationId: item.data.integration_id,
            messageId: item.data.message_id,
            ticketId: item.data.ticket_id,
            shouldHide: !isHidden,
        })
    }

    const handlePrivateReply = () => {
        onFacebookCommentPrivateReply({
            integrationId: item.data.integration_id,
            messageId: item.data.message_id,
            ticketMessageId: item.data.id,
            ticketId: item.data.ticket_id,
            senderId: item.data.sender.id,
            commentMessage: item.data.body_text || '',
            source: item.data.source,
            sender: item.data.sender,
            meta: item.data.meta,
            messageCreatedDatetime: item.data.created_datetime,
        })
    }

    const handleLike = () => {
        onFacebookCommentLike({
            integrationId: item.data.integration_id,
            messageId: item.data.message_id,
            ticketId: item.data.ticket_id,
            shouldLike: !isLiked,
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
                <FacebookCommentMessage
                    item={item}
                    onUnhide={isHidden ? handleHideComment : undefined}
                    onLike={handleLike}
                    actions={
                        <FacebookCommentMessageActions
                            message={item.data}
                            isHidden={isHidden}
                            onLike={handleLike}
                            onPrivateReply={handlePrivateReply}
                            onHideComment={handleHideComment}
                        />
                    }
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
                        channel="Messenger"
                        channelIcon="channel-fb-messenger"
                        ticketId={repliedBy.ticket_id}
                        ticketMessageId={repliedBy.ticket_message_id}
                    />
                </Box>
            )}
        </Box>
    )
}
