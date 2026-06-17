import type { ReactNode } from 'react'

import cn from 'classnames'

import { Box } from '@gorgias/axiom'

import { MessageErrors } from '#ticket-messages/components/MessageBubble/components/MessageErrors'
import { MessageHeaderContainer } from '#ticket-messages/components/MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageSender } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageTimestamp'
import { PendingMessageBanner } from '#ticket-messages/components/MessageBubble/components/PendingMessageBanner'
import { MessageBubble } from '#ticket-messages/components/MessageBubble/MessageBubble'
import {
    isActivePendingMessageItem,
    isFailedPendingMessageItem,
} from '#ticket-messages/predicates'
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
} from '#ticket-messages/types'
import { TicketThreadPendingState } from '#ticket-messages/types'
import type { GoToLink } from '#ticket-messages/utils/buildGoToLink'
import { getSocialChannelIcon } from '#ticket-messages/utils/getSocialChannelIcon'
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
