import type { ReactNode } from 'react'

import cn from 'classnames'

import { Box } from '@gorgias/axiom'

import {
    isActivePendingMessageItem,
    isFailedPendingMessageItem,
} from '../../predicates'
import type {
    TicketThreadSingleMessageItem,
    TicketThreadSocialMediaFacebookCommentItem,
    TicketThreadSocialMediaFacebookMessageItem,
    TicketThreadSocialMediaFacebookPostItem,
    TicketThreadSocialMediaInstagramCommentItem,
    TicketThreadSocialMediaInstagramDirectMessageItem,
    TicketThreadSocialMediaInstagramMediaItem,
    TicketThreadSocialMediaInstagramStoryMentionItem,
    TicketThreadSocialMediaInstagramStoryReplyItem,
    TicketThreadSocialMediaTwitterDirectMessageItem,
    TicketThreadSocialMediaTwitterTweetItem,
    TicketThreadSocialMediaWhatsAppMessageItem,
} from '../../types'
import { TicketThreadPendingState } from '../../types'
import type { GoToLink } from '../../utils/buildGoToLink'
import { getSocialChannelIcon } from '../../utils/getSocialChannelIcon'
import { MessageErrors } from '../MessageBubble/components/MessageErrors'
import { MessageHeaderContainer } from '../MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '../MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '../MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageSender } from '../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../MessageBubble/components/MessageHeader/MessageTimestamp'
import { PendingMessageBanner } from '../MessageBubble/components/PendingMessageBanner'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { GoToLinkFooter } from './GoToLinkFooter'

import css from './SocialMessageBubble.less'

export type SocialMessageBubbleProps = {
    item: Extract<
        TicketThreadSingleMessageItem,
        | TicketThreadSocialMediaFacebookCommentItem
        | TicketThreadSocialMediaFacebookPostItem
        | TicketThreadSocialMediaFacebookMessageItem
        | TicketThreadSocialMediaInstagramCommentItem
        | TicketThreadSocialMediaInstagramDirectMessageItem
        | TicketThreadSocialMediaInstagramMediaItem
        | TicketThreadSocialMediaInstagramStoryMentionItem
        | TicketThreadSocialMediaInstagramStoryReplyItem
        | TicketThreadSocialMediaTwitterTweetItem
        | TicketThreadSocialMediaTwitterDirectMessageItem
        | TicketThreadSocialMediaWhatsAppMessageItem
    >
    goToLink?: GoToLink | null
    channelIcon?: string | null
    channelName?: string
    channelFrom?: string | null
    channelTo?: string | null
    children: ReactNode
    failedMessageError?: string
    className?: string
}

export function SocialMessageBubble({
    item,
    goToLink,
    channelIcon,
    channelName,
    channelFrom,
    channelTo,
    children,
    failedMessageError,
    className,
}: SocialMessageBubbleProps) {
    const resolvedChannelIcon = channelIcon ?? getSocialChannelIcon(item._tag)
    const resolvedChannelName = channelName ?? item.data.channel
    const variant = item.data.from_agent ? 'from-agent' : 'regular'
    const hasFailed = !!item.data.failed_datetime
    const isPendingMessage = isActivePendingMessageItem(item)
    const isFailedPendingState = isFailedPendingMessageItem(item)

    return (
        <MessageBubble
            variant={variant}
            className={className}
            pendingState={
                isFailedPendingState
                    ? TicketThreadPendingState.Failed
                    : isPendingMessage
                      ? TicketThreadPendingState.Active
                      : undefined
            }
        >
            <Box
                flexDirection="column"
                gap="xs"
                className={cn({ [css.failed]: hasFailed })}
                width="100%"
                display="flex"
            >
                <MessageHeaderContainer>
                    <Box alignItems="center" gap="xs">
                        <MessageAvatar
                            sender={item.data.sender}
                            fromAgent={item.data.from_agent}
                            showCustomerLastSeenStatus={
                                item.shouldShowCustomerLastSeenStatus
                            }
                        />
                        <MessageSender sender={item.data.sender} />
                    </Box>
                    <Box alignItems="center" gap="xs">
                        <MessageChannel
                            channel={item.data.channel}
                            channelIcon={resolvedChannelIcon}
                            channelName={resolvedChannelName}
                            createdDatetime={item.data.created_datetime}
                            from={channelFrom}
                            to={channelTo}
                        />
                        <MessageDeliveryIcon item={item} />
                        <MessageTimestamp
                            createdDatetime={item.data.created_datetime}
                        />
                    </Box>
                </MessageHeaderContainer>
                {children}
                {goToLink && <GoToLinkFooter goToLink={goToLink} />}
            </Box>
            {isPendingMessage ? (
                <PendingMessageBanner message={item.data} />
            ) : null}
            <MessageErrors
                message={item.data}
                ticketId={item.data.ticket_id}
                failedMessageError={failedMessageError}
                isPending={isPendingMessage}
            />
        </MessageBubble>
    )
}
