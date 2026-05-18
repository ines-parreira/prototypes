import type { ReactNode } from 'react'

import { Text } from '@gorgias/axiom'

import { isSocialMediaHiddenComment } from '../../hooks/messages/predicates'
import type { TicketThreadSocialMediaInstagramCommentItem } from '../../hooks/messages/types'
import { buildGoToLink } from '../../utils/buildGoToLink'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { HiddenCommentBanner } from '../SocialMessageBubble/HiddenCommentBanner'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { useDisplayedTicketMessage } from '../TicketMessage/hooks/useDisplayedTicketMessage'

import css from './InstagramCommentMessage.less'

type InstagramCommentMessageProps = {
    item: TicketThreadSocialMediaInstagramCommentItem
    onUnhide?: () => void
    actions?: ReactNode
}

export function InstagramCommentMessage({
    item,
    onUnhide,
    actions,
}: InstagramCommentMessageProps) {
    const displayedItem = useDisplayedTicketMessage({ item })
    const isHidden = isSocialMediaHiddenComment(displayedItem.data)
    const isAdComment =
        displayedItem.data.source.type === 'instagram-ad-comment'
    const goToLink = buildGoToLink({
        source: displayedItem.data.source as any,
        meta: displayedItem.data.meta as any,
        messageId: displayedItem.data.message_id ?? undefined,
        integrationId: displayedItem.data.integration_id,
        externalId: displayedItem.data.external_id,
        messageCreatedDatetime: displayedItem.data.created_datetime,
    })
    const source = displayedItem.data.source as any
    const channelFrom = source?.from?.name ?? null
    const channelTo = source?.to?.[0]?.name ?? null
    if (isHidden) {
        return (
            <SocialMessageBubble
                item={displayedItem}
                channelName="Instagram comment"
                channelFrom={channelFrom}
                channelTo={channelTo}
                failedMessageError="We couldn't deliver your comment"
                className={css.hidden}
            >
                <HiddenCommentBanner onUnhide={onUnhide} />
                <MessageBody item={displayedItem} />
                <MessageFooter item={displayedItem} />
                {actions}
            </SocialMessageBubble>
        )
    }

    return (
        <SocialMessageBubble
            item={displayedItem}
            goToLink={goToLink}
            channelName="Instagram comment"
            channelFrom={channelFrom}
            channelTo={channelTo}
            failedMessageError="We couldn't deliver your comment"
        >
            {isAdComment && <Text size="sm">Ad</Text>}
            <MessageBody item={displayedItem} />
            <MessageFooter item={displayedItem} />
            {actions}
        </SocialMessageBubble>
    )
}
