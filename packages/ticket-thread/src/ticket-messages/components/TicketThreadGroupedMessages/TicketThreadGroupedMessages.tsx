import type { CSSProperties, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'

import cn from 'classnames'

import { Box } from '@gorgias/axiom'

import { TicketThreadItemTag } from '#thread/itemTags'
import { ViewOnInstagramLink } from '#ticket-messages/components/InstagramMediaMessage/ViewOnInstagramLink'
import { MessageAppliedActions } from '#ticket-messages/components/MessageBubble/components/MessageAppliedActions'
import { MessageBody } from '#ticket-messages/components/MessageBubble/components/MessageBody'
import { MessageErrors } from '#ticket-messages/components/MessageBubble/components/MessageErrors'
import type { MessageFooterItem } from '#ticket-messages/components/MessageBubble/components/MessageFooter'
import { MessageFooter } from '#ticket-messages/components/MessageBubble/components/MessageFooter'
import { getMessageChannelParticipants } from '#ticket-messages/components/MessageBubble/components/MessageHeader/getMessageChannelParticipants'
import { getMessageCurrentPageUrl } from '#ticket-messages/components/MessageBubble/components/MessageHeader/getMessageCurrentPageUrl'
import { MessageHeaderContainer } from '#ticket-messages/components/MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageMeta } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageMeta'
import { MessageSender } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '#ticket-messages/components/MessageBubble/components/MessageHeader/MessageTimestamp'
import { PendingMessageBanner } from '#ticket-messages/components/MessageBubble/components/PendingMessageBanner'
import { MessageBubble } from '#ticket-messages/components/MessageBubble/MessageBubble'
import { useDisplayedTicketMessage } from '#ticket-messages/components/TicketMessage/hooks/useDisplayedTicketMessage'
import { TicketMessageActions } from '#ticket-messages/components/TicketMessageActions/TicketMessageActions'
import { isActivePendingMessageItem } from '#ticket-messages/predicates'
import type {
    TicketThreadGroupedMessagesItem,
    TicketThreadRegularMessageItem,
    TicketThreadSingleMessageItem,
    TicketThreadSocialMediaFacebookMessageItem,
    TicketThreadSocialMediaInstagramDirectMessageItem,
    TicketThreadSocialMediaInstagramStoryMentionItem,
    TicketThreadSocialMediaInstagramStoryReplyItem,
    TicketThreadSocialMediaWhatsAppMessageItem,
} from '#ticket-messages/types'

import css from './TicketThreadGroupedMessages.less'

type TicketThreadGroupedMessagesProps = {
    item: TicketThreadGroupedMessagesItem
}

type GroupedMessageProps = {
    item: TicketThreadSingleMessageItem
    className?: string
    children?: ReactNode
}

type SocialGroupedMessageItem =
    | TicketThreadSocialMediaFacebookMessageItem
    | TicketThreadSocialMediaInstagramDirectMessageItem
    | TicketThreadSocialMediaWhatsAppMessageItem
    | TicketThreadSocialMediaInstagramStoryMentionItem
    | TicketThreadSocialMediaInstagramStoryReplyItem

function useTimestampWidth() {
    const ref = useRef<HTMLDivElement>(null)
    const [width, setWidth] = useState(0)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const update = () => setWidth(element.offsetWidth)
        update()

        const observer = new ResizeObserver(update)
        observer.observe(element)

        return () => observer.disconnect()
    }, [])

    return {
        ref,
        style: { '--grouped-timestamp-width': `${width}px` } as CSSProperties,
    }
}

function RegularGroupedMessage({
    item,
    className,
    children,
}: {
    item: TicketThreadRegularMessageItem
    className?: string
    children?: ReactNode
}) {
    const displayedItem = useDisplayedTicketMessage({ item })
    const isPendingMessage = isActivePendingMessageItem(item)
    const { ref: timestampRef, style } = useTimestampWidth()

    return (
        <Box
            flexDirection="column"
            gap="xs"
            className={cn(css.groupedMessage, className)}
            data-grouped-message
            style={style}
        >
            <div
                ref={timestampRef}
                className={css.groupedMessageTimestamp}
                data-placement="top-right"
            >
                <MessageTimestamp
                    createdDatetime={item.data.created_datetime}
                />
            </div>
            <MessageBody item={displayedItem} />
            <MessageFooter item={displayedItem} />
            {children}
            {isPendingMessage ? (
                <PendingMessageBanner message={displayedItem.data} />
            ) : null}
            {item.data.ticket_id && (
                <MessageErrors
                    message={displayedItem.data}
                    ticketId={item.data.ticket_id}
                    isPending={isPendingMessage}
                />
            )}
        </Box>
    )
}

function getStoryMentionHref(item: SocialGroupedMessageItem): string | null {
    if (
        item._tag !==
            TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention &&
        item._tag !==
            TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply
    ) {
        return null
    }

    if (!item.data.message_id || !item.data.integration_id) {
        return null
    }

    return `/integrations/facebook/redirect/instagramstory?message_id=${item.data.message_id}&integration_id=${item.data.integration_id}`
}

function SocialGroupedMessage({
    item,
    className,
    children,
}: {
    item: SocialGroupedMessageItem
    className?: string
    children?: ReactNode
}) {
    const displayedItem = useDisplayedTicketMessage({ item })
    const isPendingMessage = isActivePendingMessageItem(item)
    const { ref: timestampRef, style } = useTimestampWidth()
    const isStoryMention =
        item._tag ===
        TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention
    const isStoryItem =
        isStoryMention ||
        item._tag ===
            TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply
    const storyHref = isStoryItem ? getStoryMentionHref(item) : undefined

    return (
        <Box
            flexDirection="column"
            gap="xs"
            className={cn(css.groupedMessage, className)}
            data-grouped-message
            style={style}
        >
            <div
                ref={timestampRef}
                className={css.groupedMessageTimestamp}
                data-placement="top-right"
            >
                <MessageTimestamp
                    createdDatetime={displayedItem.data.created_datetime}
                />
            </div>
            {isStoryItem && (
                <ViewOnInstagramLink
                    mentionType="story"
                    href={storyHref ?? undefined}
                />
            )}
            {/* Story mentions have no meaningful body — body_text is the
                generic "Mentioned you in their story" string, already conveyed
                by ViewOnInstagramLink above. Story replies have real reply text,
                so MessageBody is kept for them. */}
            {!isStoryMention && <MessageBody item={displayedItem} />}
            {!isStoryMention && (
                <MessageFooter item={displayedItem as MessageFooterItem} />
            )}
            {children}
            {isPendingMessage ? (
                <PendingMessageBanner message={displayedItem.data} />
            ) : null}
            {item.data.ticket_id && (
                <MessageErrors
                    message={displayedItem.data}
                    ticketId={item.data.ticket_id}
                    isPending={isPendingMessage}
                />
            )}
        </Box>
    )
}

function GroupedMessage({ item, className, children }: GroupedMessageProps) {
    if (
        item._tag === TicketThreadItemTag.Messages.SocialMediaFacebookMessage ||
        item._tag ===
            TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage ||
        item._tag === TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage ||
        item._tag ===
            TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention ||
        item._tag ===
            TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply
    ) {
        return (
            <SocialGroupedMessage item={item} className={className}>
                {children}
            </SocialGroupedMessage>
        )
    }

    return (
        <RegularGroupedMessage
            item={item as TicketThreadRegularMessageItem}
            className={className}
        >
            {children}
        </RegularGroupedMessage>
    )
}

function isNotSocialMessage(
    item: TicketThreadSingleMessageItem,
): item is TicketThreadRegularMessageItem {
    return (
        item._tag !== TicketThreadItemTag.Messages.SocialMediaFacebookMessage &&
        item._tag !==
            TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage &&
        item._tag !== TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage &&
        item._tag !==
            TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention &&
        item._tag !==
            TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply
    )
}

export function TicketThreadGroupedMessages({
    item,
}: TicketThreadGroupedMessagesProps) {
    const firstMessage = item.data[0]
    const lastMessage = item.data.at(-1)

    if (!firstMessage || !lastMessage) {
        return null
    }

    const variant = firstMessage.data.from_agent ? 'from-agent' : 'regular'
    const { from, to, cc, bcc } = getMessageChannelParticipants(
        firstMessage.data.source,
    )
    const currentPageUrl = getMessageCurrentPageUrl(firstMessage.data.meta)
    const senderEmail =
        firstMessage.data.source?.type === 'email'
            ? firstMessage.data.source.from?.address
            : undefined
    return (
        <Box
            flexDirection="column"
            width="100%"
            alignItems={
                firstMessage.data.from_agent ? 'flex-end' : 'flex-start'
            }
        >
            <MessageBubble variant={variant} isGroupedMessage>
                <Box flexDirection="column" className={css.groupedRoot}>
                    <Box className={css.groupedHeader} data-grouped-header>
                        <MessageHeaderContainer>
                            <Box alignItems="center" gap="xs">
                                <MessageAvatar
                                    sender={firstMessage.data.sender}
                                    fromAgent={firstMessage.data.from_agent}
                                    showCustomerLastSeenStatus={
                                        item.shouldShowCustomerLastSeenStatus
                                    }
                                />
                                <MessageSender
                                    sender={firstMessage.data.sender}
                                    email={senderEmail}
                                />
                            </Box>
                            <Box alignItems="center" gap="xs">
                                <MessageChannel
                                    channel={firstMessage.data.channel}
                                    createdDatetime={
                                        firstMessage.data.created_datetime
                                    }
                                    from={from}
                                    to={to}
                                    cc={cc}
                                    bcc={bcc}
                                    currentPageUrl={currentPageUrl}
                                />
                                <MessageDeliveryIcon item={lastMessage} />
                                <MessageTimestamp
                                    createdDatetime={
                                        lastMessage.data.created_datetime
                                    }
                                />
                            </Box>
                        </MessageHeaderContainer>
                        <TicketMessageActions message={firstMessage.data} />
                    </Box>
                    <MessageMeta
                        meta={firstMessage.data.meta}
                        messageId={firstMessage.data.message_id}
                        source={firstMessage.data.source}
                        integrationId={firstMessage.data.integration_id}
                    />
                    <Box flexDirection="column" className={css.groupedMessages}>
                        {item.data.map((groupedMessage, index) => (
                            <GroupedMessage
                                key={
                                    groupedMessage.data.id ??
                                    groupedMessage.datetime
                                }
                                item={groupedMessage}
                                className={
                                    index === 0
                                        ? css.firstGroupedMessage
                                        : undefined
                                }
                            >
                                {index !== 0 && (
                                    <TicketMessageActions
                                        message={groupedMessage.data}
                                    />
                                )}
                            </GroupedMessage>
                        ))}
                    </Box>
                </Box>
            </MessageBubble>
            {item.data.filter(isNotSocialMessage).map((msg) => (
                <MessageAppliedActions
                    key={msg.data.id ?? msg.datetime}
                    message={msg.data}
                    isPending={isActivePendingMessageItem(msg)}
                />
            ))}
        </Box>
    )
}
