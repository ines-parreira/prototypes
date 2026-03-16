import { useMemo } from 'react'

import type { ValueOf } from '@repo/types'

import { Box } from '@gorgias/axiom'

import { isTicketMessage } from '../../hooks/messages/predicates'
import type { TicketThreadMessageItem } from '../../hooks/messages/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { assertNever } from '../../utils/assertNever'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { TicketMessage } from '../TicketMessage/TicketMessage'

const Placement = {
    Left: 'left',
    Right: 'right',
}

type Placement = ValueOf<typeof Placement>

type TicketThreadMessageItemProps = {
    item: TicketThreadMessageItem
}

export function TicketThreadMessageItem({
    item,
}: TicketThreadMessageItemProps) {
    const placement = useMemo<Placement>(
        () =>
            isTicketMessage(item.data) && item.data.from_agent
                ? Placement.Right
                : Placement.Left,
        [item],
    )

    const content = useMemo(() => {
        switch (item._tag) {
            case TicketThreadItemTag.Messages.Message:
                return <TicketMessage item={item} />
            case TicketThreadItemTag.Messages.InternalNote:
                return (
                    <MessageBubble>
                        {item.data.stripped_text || item.data.body_text}
                    </MessageBubble>
                )
            case TicketThreadItemTag.Messages.AiAgentMessage:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.AiAgentInternalNote:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.AiAgentDraftMessage:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.AiAgentTrialMessage:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.SocialMediaFacebookComment:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.SocialMediaFacebookPost:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.SocialMediaFacebookMessage:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.SocialMediaInstagramComment:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.SocialMediaInstagramMedia:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.SocialMediaTwitterTweet:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            case TicketThreadItemTag.Messages.GroupedMessages:
                return <Box padding="md">{JSON.stringify(item.data)}</Box>
            default:
                return assertNever(item)
        }
    }, [item])

    return (
        <Box
            width="100%"
            justifyContent={
                placement === Placement.Right ? 'flex-end' : 'flex-start'
            }
        >
            {content}
        </Box>
    )
}
