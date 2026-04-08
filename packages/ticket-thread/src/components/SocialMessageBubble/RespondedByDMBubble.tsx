import { Box, Icon } from '@gorgias/axiom'
import { useGetTicketMessage } from '@gorgias/helpdesk-queries'

import { MessageHeaderContainer } from '../MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '../MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageSender } from '../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { RepliedViaLabel } from './RepliedViaLabel'

type RespondedByDMBubbleProps = {
    channel: string
    channelIcon: string
    ticketId: number
    ticketMessageId: number
}

export function RespondedByDMBubble({
    channel,
    channelIcon,
    ticketId,
    ticketMessageId,
}: RespondedByDMBubbleProps) {
    const { data } = useGetTicketMessage(ticketId, ticketMessageId, {
        query: {
            refetchInterval: false,
            refetchOnWindowFocus: false,
        },
    })
    const message = data?.data
    const sender = message?.sender

    return (
        <MessageBubble variant="from-agent">
            {sender && (
                <MessageHeaderContainer>
                    <Box alignItems="center" gap="xs">
                        <MessageAvatar sender={sender} />
                        <MessageSender sender={sender} />
                    </Box>
                    <Box alignItems="center" gap="xs">
                        <MessageChannel
                            channelIcon={channelIcon}
                            channelName={channel}
                            createdDatetime={message?.created_datetime}
                        />
                        {message?.failed_datetime && (
                            <Icon
                                name="close"
                                size="sm"
                                color="content-neutral-secondary"
                            />
                        )}
                        {!message?.failed_datetime &&
                            message?.opened_datetime && (
                                <Icon
                                    name="check-all"
                                    size="sm"
                                    color="content-neutral-secondary"
                                />
                            )}
                        {!message?.failed_datetime &&
                            !message?.opened_datetime &&
                            message?.sent_datetime && (
                                <Icon
                                    name="check"
                                    size="sm"
                                    color="content-neutral-secondary"
                                />
                            )}
                        {message?.created_datetime && (
                            <MessageTimestamp
                                createdDatetime={message.created_datetime}
                            />
                        )}
                    </Box>
                </MessageHeaderContainer>
            )}
            <RepliedViaLabel
                label="replied via"
                channel={channel}
                ticketId={ticketId}
            />
        </MessageBubble>
    )
}
