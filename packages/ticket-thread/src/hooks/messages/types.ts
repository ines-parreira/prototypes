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
} from './schemas'

export type TicketThreadRegularMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.Message
    data: TicketMessage
    datetime: string
    isPending?: boolean
}

export type TicketThreadInternalNoteItem = {
    _tag: typeof TicketThreadItemTag.Messages.InternalNote
    data: Prettify<TicketMessage & InternalNoteSchema>
    datetime: string
    isPending?: boolean
}

export type TicketThreadAiAgentMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.AiAgentMessage
    data: Prettify<TicketMessage & AiAgentMessageSchema>
    datetime: string
}

export type TicketThreadAiAgentInternalNoteItem = {
    _tag: typeof TicketThreadItemTag.Messages.AiAgentInternalNote
    data: Prettify<TicketMessage & AIAgentInternalNoteSchema>
    datetime: string
}

export type TicketThreadAiAgentDraftMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.AiAgentDraftMessage
    data: Prettify<TicketMessage & AiAgentDraftMessageSchema>
    datetime: string
}

export type TicketThreadAiAgentTrialMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.AiAgentTrialMessage
    data: Prettify<TicketMessage & AiAgentTrialMessageSchema>
    datetime: string
}

export type TicketThreadSocialMediaFacebookCommentItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaFacebookComment
    data: Prettify<TicketMessage & SocialMediaFacebookCommentSchema>
    datetime: string
}

export type TicketThreadSocialMediaFacebookPostItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaFacebookPost
    data: Prettify<TicketMessage & SocialMediaFacebookPostSchema>
    datetime: string
}

export type TicketThreadSocialMediaFacebookMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaFacebookMessage
    data: Prettify<TicketMessage & SocialMediaFacebookMessageSchema>
    datetime: string
}

export type TicketThreadSocialMediaInstagramCommentItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaInstagramComment
    data: Prettify<TicketMessage & SocialMediaInstagramCommentSchema>
    datetime: string
}

export type TicketThreadSocialMediaInstagramDirectMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaInstagramDirectMessage
    data: Prettify<TicketMessage & SocialMediaInstagramDirectMessageSchema>
    datetime: string
}

export type TicketThreadSocialMediaInstagramMediaItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaInstagramMedia
    data: Prettify<TicketMessage & SocialMediaInstagramMediaSchema>
    datetime: string
}

export type TicketThreadSocialMediaInstagramStoryMentionItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention
    data: Prettify<TicketMessage & SocialMediaInstagramStoryMentionSchema>
    datetime: string
}

export type TicketThreadSocialMediaInstagramStoryReplyItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply
    data: Prettify<TicketMessage & SocialMediaInstagramStoryReplySchema>
    datetime: string
}

export type TicketThreadSocialMediaTwitterTweetItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaTwitterTweet
    data: Prettify<TicketMessage & SocialMediaTwitterTweetSchema>
    datetime: string
}

export type TicketThreadSocialMediaTwitterDirectMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage
    data: Prettify<TicketMessage & SocialMediaTwitterDirectMessageSchema>
    datetime: string
}
export type TicketThreadSocialMediaWhatsAppMessageItem = {
    _tag: typeof TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage
    data: Prettify<TicketMessage & SocialMediaWhatsAppMessageSchema>
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

export type TicketThreadMergedMessagesItem = {
    _tag: typeof TicketThreadItemTag.Messages.MergedMessages
    data: TicketThreadSingleMessageItem[]
    datetime: string
}

export type TicketThreadMessageItem =
    | TicketThreadSingleMessageItem
    | TicketThreadMergedMessagesItem
