import { useMemo } from 'react'

import type { ValueOf } from '@repo/types'

import { Box } from '@gorgias/axiom'

import type { TicketThreadMessageItem } from '../../hooks/messages/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { assertNever } from '../../utils/assertNever'
import { MessageBubble } from '../MessageBubble/MessageBubble'
import { TicketMessage } from '../TicketMessage/TicketMessage'
import { WhatsAppMessageWrapper } from '../WhatsAppMessage/WhatsAppMessageWrapper'
import { AiAgentTicketThreadDraftMessage } from './AiAgentTicketThreadMessages/AiAgentTicketThreadDraftMessage'
import { AiAgentTicketThreadInternalNote } from './AiAgentTicketThreadMessages/AiAgentTicketThreadInternalNote'
import { AiAgentTicketThreadMessage } from './AiAgentTicketThreadMessages/AiAgentTicketThreadMessage'
import { AiAgentTicketThreadTrialMessage } from './AiAgentTicketThreadMessages/AiAgentTicketThreadTrialMessage'

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
    const placement = useMemo<Placement>(() => {
        if (item._tag === TicketThreadItemTag.Messages.GroupedMessages) {
            const first = item.data[0]
            return first && 'from_agent' in first.data && first.data.from_agent
                ? Placement.Right
                : Placement.Left
        }

        return 'from_agent' in item.data && item.data.from_agent
            ? Placement.Right
            : Placement.Left
    }, [item])

    const content = useMemo(() => {
        switch (item._tag) {
            case TicketThreadItemTag.Messages.Message:
                return <TicketMessage item={item} />
            case TicketThreadItemTag.Messages.InternalNote:
                return (
                    <MessageBubble variant="internal-note">
                        {item.data.stripped_text || item.data.body_text}
                    </MessageBubble>
                )
            case TicketThreadItemTag.Messages.AiAgentMessage:
                return <AiAgentTicketThreadMessage item={item} />
            case TicketThreadItemTag.Messages.AiAgentInternalNote:
                return <AiAgentTicketThreadInternalNote item={item} />
            case TicketThreadItemTag.Messages.AiAgentDraftMessage:
                return <AiAgentTicketThreadDraftMessage item={item} />
            case TicketThreadItemTag.Messages.AiAgentTrialMessage:
                return <AiAgentTicketThreadTrialMessage item={item} />
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
                return <WhatsAppMessageWrapper item={item} />
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
