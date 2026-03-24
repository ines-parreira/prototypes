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
import type { TicketThreadMessageData } from './types'

export function isTicketMessage(
    input: unknown,
): input is TicketThreadMessageData {
    return ticketMessageSchema.safeParse(input).success
}

export function isFailedPendingMessage(
    input: unknown,
): input is TicketThreadMessageData<FailedPendingMessageSchema> {
    return failedPendingMessageSchema.safeParse(input).success
}

export function isActivePendingMessage(
    input: unknown,
): input is TicketThreadMessageData<ActivePendingMessageSchema> {
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
): input is TicketThreadMessageData<InternalNoteSchema> {
    return isTicketMessage(input) && internalNoteSchema.safeParse(input).success
}

export function isAiAgentMessage(
    input: unknown,
): input is TicketThreadMessageData<AiAgentMessageSchema> {
    return (
        isTicketMessage(input) && aiAgentMessageSchema.safeParse(input).success
    )
}

export function isAiAgentInternalNote(
    input: unknown,
): input is TicketThreadMessageData<AIAgentInternalNoteSchema> {
    return (
        isTicketMessage(input) &&
        aiAgentInternalNoteSchema.safeParse(input).success
    )
}

export function isAiAgentDraftMessage(
    input: unknown,
): input is TicketThreadMessageData<AiAgentDraftMessageSchema> {
    return (
        isTicketMessage(input) &&
        aiAgentDraftMessageSchema.safeParse(input).success
    )
}

export function isAiAgentTrialMessage(
    input: unknown,
): input is TicketThreadMessageData<AiAgentTrialMessageSchema> {
    return (
        isTicketMessage(input) &&
        aiAgentTrialMessageSchema.safeParse(input).success
    )
}

export function isSocialMediaFacebookComment(
    input: unknown,
): input is TicketThreadMessageData<SocialMediaFacebookCommentSchema> {
    return (
        isTicketMessage(input) &&
        socialMediaFacebookCommentSchema.safeParse(input).success
    )
}

export function isSocialMediaFacebookPost(
    input: unknown,
): input is TicketThreadMessageData<SocialMediaFacebookPostSchema> {
    return (
        isTicketMessage(input) &&
        socialMediaFacebookPostSchema.safeParse(input).success
    )
}

export function isSocialMediaFacebookMessage(
    input: unknown,
): input is TicketThreadMessageData<SocialMediaFacebookMessageSchema> {
    return (
        isTicketMessage(input) &&
        socialMediaFacebookMessageSchema.safeParse(input).success
    )
}

export function isSocialMediaInstagramComment(
    input: unknown,
): input is TicketThreadMessageData<SocialMediaInstagramCommentSchema> {
    return (
        isTicketMessage(input) &&
        socialMediaInstagramCommentSchema.safeParse(input).success
    )
}

export function isSocialMediaInstagramDirectMessage(
    input: unknown,
): input is TicketThreadMessageData<SocialMediaInstagramDirectMessageSchema> {
    return (
        isTicketMessage(input) &&
        socialMediaInstagramDirectMessageSchema.safeParse(input).success
    )
}

export function isSocialMediaInstagramMedia(
    input: unknown,
): input is TicketThreadMessageData<SocialMediaInstagramMediaSchema> {
    return (
        isTicketMessage(input) &&
        socialMediaInstagramMediaSchema.safeParse(input).success
    )
}

export function isSocialMediaTwitterTweet(
    input: unknown,
): input is TicketThreadMessageData<SocialMediaTwitterTweetSchema> {
    return (
        isTicketMessage(input) &&
        socialMediaTwitterTweetSchema.safeParse(input).success
    )
}

export function isSocialMediaTwitterDirectMessage(
    input: unknown,
): input is TicketThreadMessageData<SocialMediaTwitterDirectMessageSchema> {
    return (
        isTicketMessage(input) &&
        socialMediaTwitterDirectMessageSchema.safeParse(input).success
    )
}

export function isSocialMediaWhatsAppMessage(
    input: unknown,
): input is TicketThreadMessageData<SocialMediaWhatsAppMessageSchema> {
    return (
        isTicketMessage(input) &&
        socialMediaWhatsAppMessageSchema.safeParse(input).success
    )
}

export function isSocialMediaHiddenComment(input: unknown): boolean {
    return socialMediaHiddenCommentSchema.safeParse(input).success
}

export function isSocialMediaDeletedComment(input: unknown): boolean {
    return socialMediaDeletedCommentSchema.safeParse(input).success
}

export function isSocialMediaInstagramStoryMention(
    input: unknown,
): input is TicketThreadMessageData<SocialMediaInstagramStoryMentionSchema> {
    return (
        isTicketMessage(input) &&
        socialMediaInstagramStoryMentionSchema.safeParse(input).success
    )
}

export function isSocialMediaInstagramStoryReply(
    input: unknown,
): input is TicketThreadMessageData<SocialMediaInstagramStoryReplySchema> {
    return (
        isTicketMessage(input) &&
        socialMediaInstagramStoryReplySchema.safeParse(input).success
    )
}
