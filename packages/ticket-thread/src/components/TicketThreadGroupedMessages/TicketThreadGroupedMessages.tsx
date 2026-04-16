import type { ReactNode } from 'react'

import cn from 'classnames'

import { Box } from '@gorgias/axiom'

import type {
    TicketThreadGroupedMessagesItem,
    TicketThreadRegularMessageItem,
    TicketThreadSingleMessageItem,
} from '../../hooks/messages/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageErrors } from '../MessageBubble/components/MessageErrors'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { getMessageChannelParticipants } from '../MessageBubble/components/MessageHeader/getMessageChannelParticipants'
import { MessageHeaderContainer } from '../MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '../MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '../MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageSender } from '../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { useDisplayedTicketMessage } from '../TicketMessage/hooks/useDisplayedTicketMessage'
import { TicketMessageActions } from '../TicketMessageActions/TicketMessageActions'

import css from './TicketThreadGroupedMessages.less'

type TicketThreadGroupedMessagesProps = {
    item: TicketThreadGroupedMessagesItem
}

type GroupedMessageProps = {
    item: TicketThreadSingleMessageItem
    className?: string
    children?: ReactNode
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

    return (
        <Box
            flexDirection="column"
            gap="xs"
            className={cn(css.groupedMessage, className)}
            data-grouped-message
        >
            <MessageBody item={displayedItem} />
            <MessageFooter item={displayedItem} />
            {children}
            {item.data.ticket_id && (
                <MessageErrors
                    message={displayedItem.data}
                    ticketId={item.data.ticket_id}
                    isPending={'isPending' in item ? item.isPending : undefined}
                />
            )}
        </Box>
    )
}

function SocialGroupedMessage({
    item,
    className,
    children,
}: GroupedMessageProps) {
    return (
        <Box
            flexDirection="column"
            gap="xs"
            className={cn(css.groupedMessage, className)}
            data-grouped-message
        >
            <MessageBody item={item} />
            {children}
            {item.data.ticket_id && (
                <MessageErrors
                    message={item.data}
                    ticketId={item.data.ticket_id}
                    isPending={'isPending' in item ? item.isPending : undefined}
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
        item._tag === TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage
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

    return (
        <MessageBubble variant={variant} isGroupedMessage>
            <Box flexDirection="column" className={css.groupedRoot}>
                <Box className={css.groupedHeader} data-grouped-header>
                    <MessageHeaderContainer>
                        <Box alignItems="center" gap="xs">
                            <MessageAvatar sender={firstMessage.data.sender} />
                            <MessageSender sender={firstMessage.data.sender} />
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
    )
}
