import type { ReactNode } from 'react'

import { Tag, TagColor } from '@gorgias/axiom'

import {
    isSocialMediaDeletedComment,
    isSocialMediaHiddenComment,
} from '../../hooks/messages/predicates'
import type { TicketThreadSocialMediaFacebookCommentItem } from '../../hooks/messages/types'
import { buildGoToLink } from '../../utils/buildGoToLink'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { DeletedCommentBanner } from '../SocialMessageBubble/DeletedCommentBanner'
import { HiddenCommentBanner } from '../SocialMessageBubble/HiddenCommentBanner'
import { RepliedViaLabel } from '../SocialMessageBubble/RepliedViaLabel'
import { SocialMessageBubble } from '../SocialMessageBubble/SocialMessageBubble'
import { ViewOnSocialLink } from '../SocialMessageBubble/ViewOnSocialLink'
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
    const isHidden = isSocialMediaHiddenComment(item.data)
    const isDeleted = isSocialMediaDeletedComment(item.data)

    type GoToLinkParams = Parameters<typeof buildGoToLink>[0]
    const goToLink = buildGoToLink({
        source: item.data.source as GoToLinkParams['source'],
        meta: item.data.meta as GoToLinkParams['meta'],
        messageId: item.data.message_id ?? undefined,
        integrationId: item.data.integration_id,
        externalId: item.data.external_id,
        messageCreatedDatetime: item.data.created_datetime,
    })

    const channelFrom = item.data.source?.from?.name ?? null
    const channelTo = item.data.source?.to?.[0]?.name ?? null

    const meta = item.data.meta as FacebookCommentMeta | null
    const repliedBy = meta?.replied_by
    const isLiked = Boolean(
        meta?.facebook_reactions?.page_reaction?.reaction_type,
    )

    if (isDeleted) {
        return (
            <SocialMessageBubble
                item={item}
                goToLink={null}
                channelFrom={channelFrom}
                channelTo={channelTo}
                className={css.deleted}
            >
                <DeletedCommentBanner />
                <MessageBody item={item} />
            </SocialMessageBubble>
        )
    }

    if (isHidden) {
        return (
            <SocialMessageBubble
                item={item}
                goToLink={null}
                channelFrom={channelFrom}
                channelTo={channelTo}
                className={css.hidden}
            >
                <HiddenCommentBanner onUnhide={onUnhide} />
                <MessageBody item={item} />
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
            item={item}
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
            <MessageBody item={item} />
            {repliedBy && (
                <RepliedViaLabel
                    channel="Messenger"
                    ticketId={repliedBy.ticket_id}
                />
            )}
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
