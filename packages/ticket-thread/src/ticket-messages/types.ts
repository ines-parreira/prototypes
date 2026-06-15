import type { Prettify } from '@repo/types'

import type { TicketMessage } from '@gorgias/helpdesk-queries'

import type { TicketThreadAiAgentPseudoEvent } from '../ai-agent/types'
import type { TicketThreadItemTag } from '../thread/itemTags'
import type {
    AiAgentDraftMessageSchema,
    AiAgentHandoverMessageSchema,
    AIAgentInternalNoteSchema,
    AiAgentMessageSchema,
    AiAgentTrialMessageSchema,
    InternalNoteSchema,
    SocialMediaFacebookCommentSchema,
    SocialMediaFacebookMessageSchema,
    SocialMediaFacebookPostSchema,
    SocialMediaInstagramCommentSchema,
    SocialMediaInstagramDirectMessageSchema,
    SocialMediaInstagramMediaSchema,
    SocialMediaInstagramStoryMentionSchema,
    SocialMediaInstagramStoryReplySchema,
    SocialMediaTwitterDirectMessageSchema,
    SocialMediaTwitterTweetSchema,
    SocialMediaWhatsAppMessageSchema,
    TicketMessageSchema,
} from './schemas'

export type TicketThreadMessageData<TSchema extends object = {}> = Prettify<
    TicketMessage & Pick<TicketMessageSchema, 'channel'> & TSchema
>

export type TicketThreadMessageDecorations = {
    aiAgentPseudoEvent?: TicketThreadAiAgentPseudoEvent
}

type TicketThreadAiAgentMessageData<TSchema extends object> =
    TicketThreadMessageData<
        TSchema & {
            decorations?: TicketThreadMessageDecorations
        }
    >

export const TicketThreadPendingState = {
    Active: 'active',
    Failed: 'failed',
} as const

export type TicketThreadPendingState =
    (typeof TicketThreadPendingState)[keyof typeof TicketThreadPendingState]

type TicketThreadSingleMessageItemBase<TTag, TData> = {
    _tag: TTag
    data: TData
    datetime: string
    pendingState?: TicketThreadPendingState
    shouldShowCustomerLastSeenStatus?: boolean
}

export type TicketThreadRegularMessageItem = TicketThreadSingleMessageItemBase<
    typeof TicketThreadItemTag.Messages.Message,
    TicketThreadMessageData
>

export type TicketThreadInternalNoteItem = TicketThreadSingleMessageItemBase<
    typeof TicketThreadItemTag.Messages.InternalNote,
    TicketThreadMessageData<InternalNoteSchema>
>

export type TicketThreadAiAgentMessageItem = TicketThreadSingleMessageItemBase<
    typeof TicketThreadItemTag.Messages.AiAgentMessage,
    TicketThreadAiAgentMessageData<AiAgentMessageSchema>
>

export type TicketThreadAiAgentInternalNoteItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.AiAgentInternalNote,
        TicketThreadAiAgentMessageData<AIAgentInternalNoteSchema>
    >
export type TicketThreadAiAgentHandoverMessageItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.AiAgentHandoverMessage,
        TicketThreadMessageData<AiAgentHandoverMessageSchema>
    >

export type TicketThreadAiAgentTrialMessageItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.AiAgentTrialMessage,
        TicketThreadMessageData<AiAgentTrialMessageSchema>
    >

export type TicketThreadAiAgentDraftMessageItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.AiAgentDraftMessage,
        TicketThreadMessageData<AiAgentDraftMessageSchema>
    >

export type TicketThreadSocialMediaFacebookCommentItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.SocialMediaFacebookComment,
        TicketThreadMessageData<SocialMediaFacebookCommentSchema>
    >

export type TicketThreadSocialMediaFacebookPostItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.SocialMediaFacebookPost,
        TicketThreadMessageData<SocialMediaFacebookPostSchema>
    >

export type TicketThreadSocialMediaFacebookMessageItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.SocialMediaFacebookMessage,
        TicketThreadMessageData<SocialMediaFacebookMessageSchema>
    >

export type TicketThreadSocialMediaInstagramCommentItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.SocialMediaInstagramComment,
        TicketThreadMessageData<SocialMediaInstagramCommentSchema>
    >

export type TicketThreadSocialMediaInstagramDirectMessageItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage,
        TicketThreadMessageData<SocialMediaInstagramDirectMessageSchema>
    >

export type TicketThreadSocialMediaInstagramMediaItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.SocialMediaInstagramMedia,
        TicketThreadMessageData<SocialMediaInstagramMediaSchema>
    >

export type TicketThreadSocialMediaInstagramStoryMentionItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention,
        TicketThreadMessageData<SocialMediaInstagramStoryMentionSchema>
    >

export type TicketThreadSocialMediaInstagramStoryReplyItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply,
        TicketThreadMessageData<SocialMediaInstagramStoryReplySchema>
    >

export type TicketThreadSocialMediaTwitterTweetItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.SocialMediaTwitterTweet,
        TicketThreadMessageData<SocialMediaTwitterTweetSchema>
    >

export type TicketThreadSocialMediaTwitterDirectMessageItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage,
        TicketThreadMessageData<SocialMediaTwitterDirectMessageSchema>
    >
export type TicketThreadSocialMediaWhatsAppMessageItem =
    TicketThreadSingleMessageItemBase<
        typeof TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage,
        TicketThreadMessageData<SocialMediaWhatsAppMessageSchema>
    >

export type TicketThreadSingleMessageItem =
    | TicketThreadRegularMessageItem
    | TicketThreadInternalNoteItem
    | TicketThreadAiAgentMessageItem
    | TicketThreadAiAgentInternalNoteItem
    | TicketThreadAiAgentDraftMessageItem
    | TicketThreadAiAgentTrialMessageItem
    | TicketThreadAiAgentHandoverMessageItem
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

export type TicketThreadGroupedMessagesItem = {
    _tag: typeof TicketThreadItemTag.Messages.GroupedMessages
    data: TicketThreadSingleMessageItem[]
    datetime: string
    shouldShowCustomerLastSeenStatus?: boolean
}

export type TicketThreadMessageItem =
    | TicketThreadSingleMessageItem
    | TicketThreadGroupedMessagesItem
