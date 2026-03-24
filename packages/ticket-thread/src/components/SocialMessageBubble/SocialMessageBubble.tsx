import type { ReactNode } from 'react'

import { Box } from '@gorgias/axiom'

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
} from '../../hooks/messages/types'
import type { GoToLink } from '../../utils/buildGoToLink'
import { getSocialChannelIcon } from '../../utils/getSocialChannelIcon'
import { MessageHeaderContainer } from '../MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '../MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '../MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageSender } from '../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { GoToLinkFooter } from './GoToLinkFooter'

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
    className?: string
    actions?: ReactNode
}

export function SocialMessageBubble({
    item,
    goToLink,
    channelIcon,
    channelName,
    channelFrom,
    channelTo,
    children,
    className,
    actions,
}: SocialMessageBubbleProps) {
    const resolvedChannelIcon = channelIcon ?? getSocialChannelIcon(item._tag)
    const resolvedChannelName = channelName ?? item.data.channel
    const variant = item.data.from_agent ? 'from-agent' : 'regular'

    return (
        <MessageBubble
            variant={variant}
            className={className}
            actions={actions}
        >
            <MessageHeaderContainer>
                <Box alignItems="center" gap="xs">
                    <MessageAvatar sender={item.data.sender} />
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
        </MessageBubble>
    )
}
