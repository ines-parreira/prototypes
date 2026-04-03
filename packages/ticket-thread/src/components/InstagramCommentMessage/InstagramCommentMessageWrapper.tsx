import { isSocialMediaHiddenComment } from '../../hooks/messages/predicates'
import type { TicketThreadSocialMediaInstagramCommentItem } from '../../hooks/messages/types'
import { useTicketThreadLegacyBridge } from '../../utils/LegacyBridge/useTicketThreadLegacyBridge'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'
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
    )
}
