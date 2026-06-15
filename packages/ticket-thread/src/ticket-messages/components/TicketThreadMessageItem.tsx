import { useMemo } from 'react'

import type { ValueOf } from '@repo/types'

import { Box } from '@gorgias/axiom'

import { AiAgentHandoverSummaryMessage } from '../../ai-agent/components/AiAgentTicketThreadMessages/AiAgentHandoverSummaryMessage'
import { AiAgentTicketThreadDraftMessage } from '../../ai-agent/components/AiAgentTicketThreadMessages/AiAgentTicketThreadDraftMessage'
import { AiAgentTicketThreadInternalNote } from '../../ai-agent/components/AiAgentTicketThreadMessages/AiAgentTicketThreadInternalNote'
import { AiAgentTicketThreadMessage } from '../../ai-agent/components/AiAgentTicketThreadMessages/AiAgentTicketThreadMessage'
import { AiAgentTicketThreadTrialMessage } from '../../ai-agent/components/AiAgentTicketThreadMessages/AiAgentTicketThreadTrialMessage'
import { assertNever } from '../../shared/assertNever'
import { TicketThreadItemTag } from '../../thread/itemTags'
import type { TicketThreadMessageItem } from '../types'
import { FacebookCommentMessageWrapper } from './FacebookCommentMessage/FacebookCommentMessageWrapper'
import { FacebookMessengerMessage } from './FacebookMessengerMessage/FacebookMessengerMessage'
import { FacebookPostMessage } from './FacebookPostMessage/FacebookPostMessage'
import { InstagramCommentMessageWrapper } from './InstagramCommentMessage/InstagramCommentMessageWrapper'
import { InstagramDirectMessage } from './InstagramDirectMessage/InstagramDirectMessage'
import { InstagramMediaMessage } from './InstagramMediaMessage/InstagramMediaMessage'
import { InstagramStoryMentionMessage } from './InstagramStoryMessage/InstagramStoryMentionMessage'
import { InstagramStoryReplyMessage } from './InstagramStoryMessage/InstagramStoryReplyMessage'
import { TicketInternalNote } from './TicketInternalNote/TicketInternalNote'
import { TicketMessage } from './TicketMessage/TicketMessage'
import { TicketThreadGroupedMessages } from './TicketThreadGroupedMessages/TicketThreadGroupedMessages'
import { UnimplementedMessage } from './UnimplementedMessage/UnimplementedMessage'
import { WhatsAppMessage } from './WhatsAppMessage/WhatsAppMessage'

import css from './MessageBubble/MessageBubble.less'

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
                return <TicketInternalNote item={item} />
            case TicketThreadItemTag.Messages.AiAgentMessage:
                return <AiAgentTicketThreadMessage item={item} />
            case TicketThreadItemTag.Messages.AiAgentInternalNote:
                return <AiAgentTicketThreadInternalNote item={item} />
            case TicketThreadItemTag.Messages.AiAgentDraftMessage:
                return <AiAgentTicketThreadDraftMessage item={item} />
            case TicketThreadItemTag.Messages.AiAgentTrialMessage:
                return <AiAgentTicketThreadTrialMessage item={item} />
            case TicketThreadItemTag.Messages.AiAgentHandoverMessage:
                return <AiAgentHandoverSummaryMessage item={item} />
            case TicketThreadItemTag.Messages.SocialMediaFacebookComment:
                return <FacebookCommentMessageWrapper item={item} />
            case TicketThreadItemTag.Messages.SocialMediaFacebookPost:
                return <FacebookPostMessage item={item} />
            case TicketThreadItemTag.Messages.SocialMediaFacebookMessage:
                return <FacebookMessengerMessage item={item} />
            case TicketThreadItemTag.Messages.SocialMediaInstagramComment:
                return <InstagramCommentMessageWrapper item={item} />
            case TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage:
                return <InstagramDirectMessage item={item} />
            case TicketThreadItemTag.Messages.SocialMediaInstagramMedia:
                return <InstagramMediaMessage item={item} />
            case TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention:
                return <InstagramStoryMentionMessage item={item} />
            case TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply:
                return <InstagramStoryReplyMessage item={item} />
            case TicketThreadItemTag.Messages.SocialMediaTwitterTweet:
                return <UnimplementedMessage item={item} />
            case TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage:
                return <UnimplementedMessage item={item} />
            case TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage:
                return <WhatsAppMessage item={item} />
            case TicketThreadItemTag.Messages.GroupedMessages:
                return <TicketThreadGroupedMessages item={item} />
            default:
                return assertNever(item)
        }
    }, [item])

    return (
        <Box
            data-variant={item._tag}
            width="100%"
            justifyContent={
                placement === Placement.Right ? 'flex-end' : 'flex-start'
            }
            className={css.messageRow}
            paddingBottom="xxxs"
            paddingTop="xxxs"
        >
            {content}
        </Box>
    )
}
