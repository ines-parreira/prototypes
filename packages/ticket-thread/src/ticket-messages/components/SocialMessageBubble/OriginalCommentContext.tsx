import { Box, Text } from '@gorgias/axiom'
import { useGetTicketMessage } from '@gorgias/helpdesk-queries'

import type { TicketMessageChannel } from '../../schemas'
import { getMessageChannelParticipants } from '../MessageBubble/components/MessageHeader/getMessageChannelParticipants'
import { MessageHeaderContainer } from '../MessageBubble/components/MessageHeader/Layout'
import { MessageAvatar } from '../MessageBubble/components/MessageHeader/MessageAvatar'
import { MessageChannel } from '../MessageBubble/components/MessageHeader/MessageChannel'
import { MessageSender } from '../MessageBubble/components/MessageHeader/MessageSender'
import { MessageTimestamp } from '../MessageBubble/components/MessageHeader/MessageTimestamp'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { RepliedViaLabel } from './RepliedViaLabel'

type OriginalCommentContextProps = {
    ticketId: number
    ticketMessageId: number
}

function getChannelDisplayName(channel: string): string {
    if (channel.startsWith('instagram')) return 'Instagram'
    if (channel.startsWith('facebook')) return 'Facebook'
    return channel
}

export function OriginalCommentContext({
    ticketId,
    ticketMessageId,
}: OriginalCommentContextProps) {
    const { data } = useGetTicketMessage(ticketId, ticketMessageId, {
        query: {
            refetchInterval: false,
            refetchOnWindowFocus: false,
        },
    })
    const message = data?.data
    const sender = message?.sender

    if (!message) return null

    const channelDisplayName = message.channel
        ? getChannelDisplayName(message.channel)
        : null
    const { from, to, cc, bcc } = getMessageChannelParticipants(message.source)

    return (
        <MessageBubble variant="regular">
            {sender && (
                <MessageHeaderContainer>
                    <Box alignItems="center" gap="xs">
                        <MessageAvatar
                            sender={sender}
                            fromAgent={message?.from_agent}
                        />
                        <MessageSender sender={sender} />
                    </Box>
                    <Box alignItems="center" gap="xs">
                        <MessageChannel
                            channel={message.channel as TicketMessageChannel}
                            createdDatetime={message.created_datetime}
                            from={from}
                            to={to}
                            cc={cc}
                            bcc={bcc}
                        />
                        {message.created_datetime && (
                            <MessageTimestamp
                                createdDatetime={message.created_datetime}
                            />
                        )}
                    </Box>
                </MessageHeaderContainer>
            )}
            {channelDisplayName && (
                <RepliedViaLabel
                    channel={channelDisplayName}
                    ticketId={ticketId}
                />
            )}
            {message.body_text && <Text>{message.body_text}</Text>}
        </MessageBubble>
    )
}
