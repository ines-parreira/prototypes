import cn from 'classnames'

import { Box } from '@gorgias/axiom'

import type {
    TicketThreadGroupedMessagesItem,
    TicketThreadRegularMessageItem,
    TicketThreadSingleMessageItem,
} from '../../hooks/messages/types'
import { MessageBody } from '../MessageBubble/components/MessageBody'
import { MessageErrors } from '../MessageBubble/components/MessageErrors'
import { MessageFooter } from '../MessageBubble/components/MessageFooter'
import { MessageHeaderContainer } from '../MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '../MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageDeliveryIcon } from '../MessageBubble/components/MessageHeader/MessageDeliveryIcon'
import { MessageSender } from '../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { useDisplayedTicketMessage } from '../TicketMessage/hooks/useDisplayedTicketMessage'

import css from './TicketThreadGroupedMessages.less'

type TicketThreadGroupedMessagesProps = {
    item: TicketThreadGroupedMessagesItem
}

type GroupedMessageProps = {
    item: TicketThreadSingleMessageItem
    className?: string
}

function GroupedMessage({ item, className }: GroupedMessageProps) {
    const displayedItem = useDisplayedTicketMessage({
        item: item as TicketThreadRegularMessageItem,
    })

    return (
        <Box
            flexDirection="column"
            gap="xs"
            className={cn(css.groupedMessage, className)}
        >
            <MessageBody item={displayedItem} />
            <MessageFooter item={displayedItem} />
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

export function TicketThreadGroupedMessages({
    item,
}: TicketThreadGroupedMessagesProps) {
    const firstMessage = item.data[0]
    const lastMessage = item.data.at(-1)

    if (!firstMessage || !lastMessage) {
        return null
    }

    const variant = firstMessage.data.from_agent ? 'from-agent' : 'regular'

    return (
        <MessageBubble variant={variant} isGroupedMessage>
            <Box flexDirection="column" className={css.groupedRoot}>
                <Box className={css.groupedHeader}>
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
                            />
                            <MessageDeliveryIcon item={lastMessage} />
                            <MessageTimestamp
                                createdDatetime={
                                    lastMessage.data.created_datetime
                                }
                            />
                        </Box>
                    </MessageHeaderContainer>
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
                        />
                    ))}
                </Box>
            </Box>
        </MessageBubble>
    )
}
