import { Box } from '@gorgias/axiom'

import type { TicketThreadMessageItem } from '../../hooks/messages/types'
import { TicketThreadItemTag } from '../../hooks/types'
import { assertNever } from '../../utils/assertNever'

type TicketThreadMessageItemProps = {
    item: TicketThreadMessageItem
}

export function TicketThreadMessageItem({
    item,
}: TicketThreadMessageItemProps) {
    switch (item._tag) {
        case TicketThreadItemTag.Messages.Message:
            return <Box padding="md">{JSON.stringify(item.data)}</Box>
        case TicketThreadItemTag.Messages.InternalNote:
            return <Box padding="md">{JSON.stringify(item.data)}</Box>
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
        case TicketThreadItemTag.Messages.MergedMessages:
            return <Box padding="md">{JSON.stringify(item.data)}</Box>
        default:
            return assertNever(item)
    }
}
