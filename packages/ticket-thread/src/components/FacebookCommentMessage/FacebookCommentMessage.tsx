import type { ReactNode } from 'react'

import { Tag, TagColor } from '@gorgias/axiom'

import {
    isSocialMediaDeletedComment,
    isSocialMediaHiddenComment,
} from '../../hooks/messages/predicates'
import type { TicketThreadSocialMediaFacebookCommentItem } from '../../hooks/messages/types'
import { buildGoToLink } from '../../utils/buildGoToLink'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { DeletedCommentBanner } from '../SocialMessageBubble/DeletedCommentBanner'
import { HiddenCommentBanner } from '../SocialMessageBubble/HiddenCommentBanner'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { ViewOnSocialLink } from '../SocialMessageBubble/ViewOnSocialLink'
import { useDisplayedTicketMessage } from '../TicketMessage/hooks/useDisplayedTicketMessage'
import type { FacebookCommentMeta } from './types'

import css from './FacebookCommentMessage.less'

type FacebookCommentMessageProps = {
    item: TicketThreadSocialMediaFacebookCommentItem
    actions?: ReactNode
    onLike?: () => void
    onUnhide?: () => void
}

export function FacebookCommentMessage({
    item,
    actions,
    onLike,
    onUnhide,
}: FacebookCommentMessageProps) {
    const displayedItem = useDisplayedTicketMessage({ item })
    const message = displayedItem.data
    const isHidden = isSocialMediaHiddenComment(message)
    const isDeleted = isSocialMediaDeletedComment(message)

    type GoToLinkParams = Parameters<typeof buildGoToLink>[0]
    const goToLink = buildGoToLink({
        source: message.source as GoToLinkParams['source'],
        meta: message.meta as GoToLinkParams['meta'],
        messageId: message.message_id ?? undefined,
        integrationId: message.integration_id,
        externalId: message.external_id,
        messageCreatedDatetime: message.created_datetime,
    })

    const channelFrom = message.source?.from?.name ?? null
    const channelTo = message.source?.to?.[0]?.name ?? null

    const meta = message.meta as FacebookCommentMeta | null
    const isLiked = Boolean(
        meta?.facebook_reactions?.page_reaction?.reaction_type,
    )

    if (isDeleted) {
        return (
            <SocialMessageBubble
                item={displayedItem}
                goToLink={null}
                channelFrom={channelFrom}
                channelTo={channelTo}
                className={css.deleted}
            >
                <DeletedCommentBanner />
                <MessageBody item={displayedItem} />
                <MessageFooter item={displayedItem} />
            </SocialMessageBubble>
        )
    }

    if (isHidden) {
        return (
            <SocialMessageBubble
                item={displayedItem}
                goToLink={null}
                channelFrom={channelFrom}
                channelTo={channelTo}
                className={css.hidden}
            >
                <HiddenCommentBanner onUnhide={onUnhide} />
                <MessageBody item={displayedItem} />
                <MessageFooter item={displayedItem} />
                {isLiked && (
                    <div>
                        <Tag
                            color={TagColor.Blue}
                            size="md"
                            leadingSlot="thumbs-up"
                            onClose={onLike}
                        >
                            Liked
                        </Tag>
                    </div>
                )}
                {actions}
            </SocialMessageBubble>
        )
    }

    return (
        <SocialMessageBubble
            item={displayedItem}
            channelFrom={channelFrom}
            channelTo={channelTo}
        >
            {goToLink && (
                <ViewOnSocialLink
                    href={goToLink.link}
                    label={`view ${goToLink.type} on`}
                    platform="Facebook"
                />
            )}
            <MessageBody item={displayedItem} />
            <MessageFooter item={displayedItem} />
            {isLiked && (
                <div>
                    <Tag color={TagColor.Blue} size="sm" onClose={onLike}>
                        Liked
                    </Tag>
                </div>
            )}
            {actions}
        </SocialMessageBubble>
    )
}
