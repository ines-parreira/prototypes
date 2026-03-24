import {
    ButtonGroup,
    ButtonGroupItem,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { isSocialMediaHiddenComment } from '../../hooks/messages/predicates'
import type { TicketThreadSocialMediaInstagramCommentItem } from '../../hooks/messages/types'
import { useTicketThreadLegacyBridge } from '../../utils/LegacyBridge/useTicketThreadLegacyBridge'
import { CopyButton } from '../CopyButton/CopyButton'
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
    const fromAgent = item.data.from_agent ?? false
    const isHidden = isSocialMediaHiddenComment(item.data)
    const copyText = item.data.stripped_text || item.data.body_text || ''
    const commentBody = item.data.body_text || ''

    const handleHideComment = () => {
        onInstagramCommentHideComment?.({
            integrationId: item.data.integration_id,
            messageId: item.data.message_id,
            ticketId: item.data.ticket_id,
            shouldHide: !isHidden,
        })
    }

    const handlePrivateReply = () => {
        onInstagramCommentPrivateReply?.({
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

    const actions = fromAgent ? (
        <ButtonGroup selectedKey="" onSelectionChange={() => {}}>
            <Tooltip
                trigger={
                    <ButtonGroupItem
                        id="copy"
                        icon={<CopyButton text={copyText} />}
                    />
                }
            >
                <TooltipContent title="Copy message" />
            </Tooltip>
        </ButtonGroup>
    ) : (
        <InstagramCommentMessageActions
            message={item.data}
            copyText={copyText}
            isHidden={isHidden}
            onPrivateReply={handlePrivateReply}
            onHideComment={handleHideComment}
        />
    )

    return (
        <InstagramCommentMessage
            item={item}
            actions={actions}
            onUnhide={isHidden ? handleHideComment : undefined}
        />
    )
}
