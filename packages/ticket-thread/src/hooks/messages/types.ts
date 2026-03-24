import type { Prettify } from '@repo/types'

import type { TicketMessage } from '@gorgias/helpdesk-queries'

import type { TicketThreadItemTag } from '../types'
import type {
    AiAgentDraftMessageSchema,
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

export type TicketThreadRegularMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.Message
    data: TicketThreadMessageData
    datetime: string
    isPending?: boolean
}

export type TicketThreadInternalNoteItem = {
    _tag: typeof TicketThreadItemTag.Messages.InternalNote
    data: TicketThreadMessageData<InternalNoteSchema>
    datetime: string
    isPending?: boolean
}

export type TicketThreadAiAgentMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.AiAgentMessage
    data: TicketThreadMessageData<AiAgentMessageSchema>
    datetime: string
}

export type TicketThreadAiAgentInternalNoteItem = {
    _tag: typeof TicketThreadItemTag.Messages.AiAgentInternalNote
    data: TicketThreadMessageData<AIAgentInternalNoteSchema>
    datetime: string
}

export type TicketThreadAiAgentDraftMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.AiAgentDraftMessage
    data: TicketThreadMessageData<AiAgentDraftMessageSchema>
    datetime: string
}

export type TicketThreadAiAgentTrialMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.AiAgentTrialMessage
    data: TicketThreadMessageData<AiAgentTrialMessageSchema>
    datetime: string
}

export type TicketThreadSocialMediaFacebookCommentItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaFacebookComment
    data: TicketThreadMessageData<SocialMediaFacebookCommentSchema>
    datetime: string
}

export type TicketThreadSocialMediaFacebookPostItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaFacebookPost
    data: TicketThreadMessageData<SocialMediaFacebookPostSchema>
    datetime: string
}

export type TicketThreadSocialMediaFacebookMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaFacebookMessage
    data: TicketThreadMessageData<SocialMediaFacebookMessageSchema>
    datetime: string
}

export type TicketThreadSocialMediaInstagramCommentItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaInstagramComment
    data: TicketThreadMessageData<SocialMediaInstagramCommentSchema>
    datetime: string
}

export type TicketThreadSocialMediaInstagramDirectMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage
    data: TicketThreadMessageData<SocialMediaInstagramDirectMessageSchema>
    datetime: string
}

export type TicketThreadSocialMediaInstagramMediaItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaInstagramMedia
    data: TicketThreadMessageData<SocialMediaInstagramMediaSchema>
    datetime: string
}

export type TicketThreadSocialMediaInstagramStoryMentionItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention
    data: TicketThreadMessageData<SocialMediaInstagramStoryMentionSchema>
    datetime: string
}

export type TicketThreadSocialMediaInstagramStoryReplyItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply
    data: TicketThreadMessageData<SocialMediaInstagramStoryReplySchema>
    datetime: string
}

export type TicketThreadSocialMediaTwitterTweetItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaTwitterTweet
    data: TicketThreadMessageData<SocialMediaTwitterTweetSchema>
    datetime: string
}

export type TicketThreadSocialMediaTwitterDirectMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage
    data: TicketThreadMessageData<SocialMediaTwitterDirectMessageSchema>
    datetime: string
}
export type TicketThreadSocialMediaWhatsAppMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage
    data: TicketThreadMessageData<SocialMediaWhatsAppMessageSchema>
    datetime: string
}

export type TicketThreadSingleMessageItem =
    | TicketThreadRegularMessageItem
    | TicketThreadInternalNoteItem
    | TicketThreadAiAgentMessageItem
    | TicketThreadAiAgentInternalNoteItem
    | TicketThreadAiAgentDraftMessageItem
    | TicketThreadAiAgentTrialMessageItem
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
}

export type TicketThreadMessageItem =
    | TicketThreadSingleMessageItem
    | TicketThreadGroupedMessagesItem
