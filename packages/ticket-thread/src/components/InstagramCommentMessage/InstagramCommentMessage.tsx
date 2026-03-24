import type { ReactNode } from 'react'

import { Text } from '@gorgias/axiom'

import { isSocialMediaHiddenComment } from '../../hooks/messages/predicates'
import type { TicketThreadSocialMediaInstagramCommentItem } from '../../hooks/messages/types'
import { buildGoToLink } from '../../utils/buildGoToLink'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { HiddenCommentBanner } from '../SocialMessageBubble/HiddenCommentBanner'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'

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
    const isHidden = isSocialMediaHiddenComment(item.data)
    const isAdComment = item.data.source.type === 'instagram-ad-comment'
    const goToLink = buildGoToLink({
        source: item.data.source as any,
        meta: item.data.meta as any,
        messageId: item.data.message_id ?? undefined,
        integrationId: item.data.integration_id,
        externalId: item.data.external_id,
        messageCreatedDatetime: item.data.created_datetime,
    })
    const source = item.data.source as any
    const channelFrom = source?.from?.name ?? null
    const channelTo = source?.to?.[0]?.name ?? null

    if (isHidden) {
        return (
            <SocialMessageBubble
                item={item}
                channelName="Instagram comment"
                channelFrom={channelFrom}
                channelTo={channelTo}
                className={css.hidden}
                actions={actions}
            >
                <HiddenCommentBanner onUnhide={onUnhide} />
                <MessageBody item={item} />
            </SocialMessageBubble>
        )
    }

    return (
        <SocialMessageBubble
            item={item}
            goToLink={goToLink}
            channelName="Instagram comment"
            channelFrom={channelFrom}
            channelTo={channelTo}
            actions={actions}
        >
            {isAdComment && <Text size="sm">Ad</Text>}
            <MessageBody item={item} />
        </SocialMessageBubble>
    )
}
