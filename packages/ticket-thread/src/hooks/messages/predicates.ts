import type { Prettify } from '@repo/types'

import type { TicketMessage } from '@gorgias/helpdesk-queries'

import type {
    ActivePendingMessageSchema,
    AiAgentDraftMessageSchema,
    AIAgentInternalNoteSchema,
    AiAgentMessageSchema,
    AiAgentTrialMessageSchema,
    FailedPendingMessageSchema,
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
import {
    activePendingMessageSchema,
    aiAgentDraftMessageSchema,
    aiAgentInternalNoteSchema,
    aiAgentMessageSchema,
    aiAgentTrialMessageSchema,
    failedPendingMessageSchema,
    hiddenMessageMetaSchema,
    internalNoteSchema,
    signalMessageSchema,
    socialMediaDeletedCommentSchema,
    socialMediaFacebookCommentSchema,
    socialMediaFacebookMessageSchema,
    socialMediaFacebookPostSchema,
    socialMediaHiddenCommentSchema,
    socialMediaInstagramCommentSchema,
    socialMediaInstagramDirectMessageSchema,
    socialMediaInstagramMediaSchema,
    socialMediaInstagramStoryMentionSchema,
    socialMediaInstagramStoryReplySchema,
    socialMediaTwitterDirectMessageSchema,
    socialMediaTwitterTweetSchema,
    socialMediaWhatsAppMessageSchema,
    ticketMessageSchema,
} from './schemas'

export function isTicketMessage(
    input: unknown,
): input is Prettify<TicketMessage & TicketMessageSchema> {
    return ticketMessageSchema.safeParse(input).success
}

export function isFailedPendingMessage(
    input: unknown,
): input is Prettify<TicketMessage & FailedPendingMessageSchema> {
    return failedPendingMessageSchema.safeParse(input).success
}

export function isActivePendingMessage(
    input: unknown,
): input is Prettify<TicketMessage & ActivePendingMessageSchema> {
    return (
        activePendingMessageSchema.safeParse(input).success &&
        !isFailedPendingMessage(input)
    )
}

export function isHiddenMessage(input: unknown): boolean {
    return hiddenMessageMetaSchema.safeParse(input).success
}

export function isSignalMessage(input: unknown): boolean {
    return signalMessageSchema.safeParse(input).success
}

export function isInternalNote(
    input: unknown,
): input is Prettify<TicketMessage & InternalNoteSchema> {
    return internalNoteSchema.safeParse(input).success
}

export function isAiAgentMessage(
    input: unknown,
): input is Prettify<TicketMessage & AiAgentMessageSchema> {
    return aiAgentMessageSchema.safeParse(input).success
}

export function isAiAgentInternalNote(
    input: unknown,
): input is Prettify<TicketMessage & AIAgentInternalNoteSchema> {
    return aiAgentInternalNoteSchema.safeParse(input).success
}

export function isAiAgentDraftMessage(
    input: unknown,
): input is Prettify<TicketMessage & AiAgentDraftMessageSchema> {
    return aiAgentDraftMessageSchema.safeParse(input).success
}

export function isAiAgentTrialMessage(
    input: unknown,
): input is Prettify<TicketMessage & AiAgentTrialMessageSchema> {
    return aiAgentTrialMessageSchema.safeParse(input).success
}

export function isSocialMediaFacebookComment(
    input: unknown,
): input is Prettify<TicketMessage & SocialMediaFacebookCommentSchema> {
    return socialMediaFacebookCommentSchema.safeParse(input).success
}

export function isSocialMediaFacebookPost(
    input: unknown,
): input is Prettify<TicketMessage & SocialMediaFacebookPostSchema> {
    return socialMediaFacebookPostSchema.safeParse(input).success
}

export function isSocialMediaFacebookMessage(
    input: unknown,
): input is Prettify<TicketMessage & SocialMediaFacebookMessageSchema> {
    return socialMediaFacebookMessageSchema.safeParse(input).success
}

export function isSocialMediaInstagramComment(
    input: unknown,
): input is Prettify<TicketMessage & SocialMediaInstagramCommentSchema> {
    return socialMediaInstagramCommentSchema.safeParse(input).success
}

export function isSocialMediaInstagramDirectMessage(
    input: unknown,
): input is Prettify<TicketMessage & SocialMediaInstagramDirectMessageSchema> {
    return socialMediaInstagramDirectMessageSchema.safeParse(input).success
}

export function isSocialMediaInstagramMedia(
    input: unknown,
): input is Prettify<TicketMessage & SocialMediaInstagramMediaSchema> {
    return socialMediaInstagramMediaSchema.safeParse(input).success
}

export function isSocialMediaTwitterTweet(
    input: unknown,
): input is Prettify<TicketMessage & SocialMediaTwitterTweetSchema> {
    return socialMediaTwitterTweetSchema.safeParse(input).success
}

export function isSocialMediaTwitterDirectMessage(
    input: unknown,
): input is Prettify<TicketMessage & SocialMediaTwitterDirectMessageSchema> {
    return socialMediaTwitterDirectMessageSchema.safeParse(input).success
}

export function isSocialMediaWhatsAppMessage(
    input: unknown,
): input is Prettify<TicketMessage & SocialMediaWhatsAppMessageSchema> {
    return socialMediaWhatsAppMessageSchema.safeParse(input).success
}

export function isSocialMediaHiddenComment(input: unknown): boolean {
    return socialMediaHiddenCommentSchema.safeParse(input).success
}

export function isSocialMediaDeletedComment(input: unknown): boolean {
    return socialMediaDeletedCommentSchema.safeParse(input).success
}

export function isSocialMediaInstagramStoryMention(
    input: unknown,
): input is Prettify<TicketMessage & SocialMediaInstagramStoryMentionSchema> {
    return socialMediaInstagramStoryMentionSchema.safeParse(input).success
}

export function isSocialMediaInstagramStoryReply(
    input: unknown,
): input is Prettify<TicketMessage & SocialMediaInstagramStoryReplySchema> {
    return socialMediaInstagramStoryReplySchema.safeParse(input).success
}
