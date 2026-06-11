import { z } from 'zod'

import {
    LegacyChannelSlug,
    TicketMessageSourceType,
} from '@gorgias/helpdesk-types'

import {
    AI_AGENT_BOT_EMAILS,
    AI_AGENT_DRAFT_MESSAGE_TAG,
    AI_AGENT_TRIAL_MESSAGE_TAG,
    SOCIAL_MEDIA_FACEBOOK_COMMENT_SOURCES,
    SOCIAL_MEDIA_FACEBOOK_MESSAGE_SOURCES,
    SOCIAL_MEDIA_FACEBOOK_POST_SOURCES,
    SOCIAL_MEDIA_INSTAGRAM_COMMENT_SOURCES,
    SOCIAL_MEDIA_INSTAGRAM_DIRECT_MESSAGE_SOURCES,
    SOCIAL_MEDIA_INSTAGRAM_MEDIA_SOURCES,
    SOCIAL_MEDIA_TWITTER_DIRECT_MESSAGE_SOURCES,
    SOCIAL_MEDIA_TWITTER_TWEET_SOURCES,
    SOCIAL_MEDIA_WHATSAPP_SOURCES,
} from './constants'

export const ticketMessageSchema = z.object({
    channel: z.union([
        z.nativeEnum(TicketMessageSourceType),
        z.nativeEnum(LegacyChannelSlug),
    ]),
    from_agent: z.boolean(),
    via: z.string(),
})
export type TicketMessageSchema = z.infer<typeof ticketMessageSchema>
export type TicketMessageChannel = TicketMessageSchema['channel']

export const failedPendingMessageSchema = ticketMessageSchema.extend({
    failed_datetime: z.string(),
})
export type FailedPendingMessageSchema = z.infer<
    typeof failedPendingMessageSchema
>
export const activePendingMessageSchema = ticketMessageSchema.extend({
    failed_datetime: z.string().nullable().optional(),
})
export type ActivePendingMessageSchema = z.infer<
    typeof activePendingMessageSchema
>
export const hiddenMessageMetaSchema = z.object({
    meta: z.object({ hidden: z.literal(true) }),
})
export type HiddenMessageMetaSchema = z.infer<typeof hiddenMessageMetaSchema>
export const signalMessageSchema = z.object({
    meta: z.object({ type: z.literal('signal') }),
})
export type SignalMessageSchema = z.infer<typeof signalMessageSchema>
export const internalNoteSchema = z.object({
    public: z.literal(false),
})
export type InternalNoteSchema = z.infer<typeof internalNoteSchema>
export const aiAgentMessageSchema = z.object({
    sender: z.object({
        email: z.enum(AI_AGENT_BOT_EMAILS),
    }),
})
export type AiAgentMessageSchema = z.infer<typeof aiAgentMessageSchema>
export const aiAgentInternalNoteSchema = aiAgentMessageSchema.extend({
    public: z.literal(false),
})
export type AIAgentInternalNote = z.infer<typeof aiAgentInternalNoteSchema>
export type AIAgentInternalNoteSchema = z.infer<
    typeof aiAgentInternalNoteSchema
>
export const aiAgentHandoverMessageSchema = aiAgentMessageSchema.extend({
    actions: z
        .array(
            z
                .object({
                    name: z.string(),
                    arguments: z.record(z.unknown()),
                })
                .passthrough(),
        )
        .nullable()
        .refine((actions) =>
            (actions ?? []).some(
                (action) =>
                    action.name === 'addTags' &&
                    typeof action.arguments.tags === 'string' &&
                    action.arguments.tags
                        .split(',')
                        .map((t) => t.trim())
                        .includes('ai_handover'),
            ),
        ),
})
export type AiAgentHandoverMessageSchema = z.infer<
    typeof aiAgentHandoverMessageSchema
>
export const aiAgentDraftMessageSchema = aiAgentMessageSchema.extend({
    body_html: z
        .string()
        .refine((html) => html.includes(AI_AGENT_DRAFT_MESSAGE_TAG)),
})
export type AiAgentDraftMessageSchema = z.infer<
    typeof aiAgentDraftMessageSchema
>
export const aiAgentTrialMessageSchema = aiAgentMessageSchema.extend({
    body_html: z
        .string()
        .refine((html) => html.includes(AI_AGENT_TRIAL_MESSAGE_TAG)),
})
export type AiAgentTrialMessageSchema = z.infer<
    typeof aiAgentTrialMessageSchema
>
export const socialMediaFacebookCommentSchema = z.object({
    source: z.object({
        type: z.enum(SOCIAL_MEDIA_FACEBOOK_COMMENT_SOURCES),
    }),
})
export type SocialMediaFacebookCommentSchema = z.infer<
    typeof socialMediaFacebookCommentSchema
>
export const socialMediaFacebookPostSchema = z.object({
    source: z.object({
        type: z.enum(SOCIAL_MEDIA_FACEBOOK_POST_SOURCES),
        from: z.object({ name: z.string().nullish() }).nullish(),
        to: z.array(z.object({ name: z.string().nullish() })).nullish(),
        extra: z
            .object({
                page_id: z.string().nullish(),
                post_id: z.string().nullish(),
                permalink: z.string().nullish(),
            })
            .nullish(),
    }),
    meta: z.record(z.unknown()).nullish(),
})
export type SocialMediaFacebookPostSchema = z.infer<
    typeof socialMediaFacebookPostSchema
>
export const socialMediaFacebookMessageSchema = z.object({
    source: z.object({
        type: z.enum(SOCIAL_MEDIA_FACEBOOK_MESSAGE_SOURCES),
        from: z.object({ name: z.string().nullish() }).nullish(),
        to: z.array(z.object({ name: z.string().nullish() })).nullish(),
    }),
})
export type SocialMediaFacebookMessageSchema = z.infer<
    typeof socialMediaFacebookMessageSchema
>
export const socialMediaInstagramCommentSchema = z.object({
    source: z.object({
        type: z.enum(SOCIAL_MEDIA_INSTAGRAM_COMMENT_SOURCES),
    }),
})
export type SocialMediaInstagramCommentSchema = z.infer<
    typeof socialMediaInstagramCommentSchema
>
export const socialMediaInstagramDirectMessageSchema = z.object({
    source: z.object({
        type: z.enum(SOCIAL_MEDIA_INSTAGRAM_DIRECT_MESSAGE_SOURCES),
        from: z.object({ name: z.string() }).optional(),
        to: z.array(z.object({ name: z.string() })).optional(),
    }),
})
export type SocialMediaInstagramDirectMessageSchema = z.infer<
    typeof socialMediaInstagramDirectMessageSchema
>
export const socialMediaInstagramMediaSchema = z.object({
    source: z.object({
        type: z.enum(SOCIAL_MEDIA_INSTAGRAM_MEDIA_SOURCES),
        from: z.object({ name: z.string() }).nullish(),
        to: z.array(z.object({ name: z.string() })).nullish(),
        extra: z
            .object({
                permalink: z.string().nullish(),
                media_type: z.string().nullish(),
            })
            .nullish(),
    }),
})
export type SocialMediaInstagramMediaSchema = z.infer<
    typeof socialMediaInstagramMediaSchema
>
export const socialMediaTwitterTweetSchema = z.object({
    source: z.object({
        type: z.enum(SOCIAL_MEDIA_TWITTER_TWEET_SOURCES),
    }),
})
export type SocialMediaTwitterTweetSchema = z.infer<
    typeof socialMediaTwitterTweetSchema
>
export const socialMediaTwitterDirectMessageSchema = z.object({
    source: z.object({
        type: z.enum(SOCIAL_MEDIA_TWITTER_DIRECT_MESSAGE_SOURCES),
    }),
})
export type SocialMediaTwitterDirectMessageSchema = z.infer<
    typeof socialMediaTwitterDirectMessageSchema
>
export const socialMediaWhatsAppMessageSchema = z.object({
    source: z.object({
        type: z.enum(SOCIAL_MEDIA_WHATSAPP_SOURCES),
    }),
})
export type SocialMediaWhatsAppMessageSchema = z.infer<
    typeof socialMediaWhatsAppMessageSchema
>
export const socialMediaHiddenCommentSchema = z.object({
    source: z.object({
        type: z.enum([
            ...SOCIAL_MEDIA_FACEBOOK_COMMENT_SOURCES,
            ...SOCIAL_MEDIA_INSTAGRAM_COMMENT_SOURCES,
        ]),
    }),
    meta: z.object({ hidden_datetime: z.string() }),
})
export type SocialMediaHiddenCommentSchema = z.infer<
    typeof socialMediaHiddenCommentSchema
>
export const socialMediaDeletedCommentSchema = z.object({
    source: z.object({
        type: z.enum(SOCIAL_MEDIA_FACEBOOK_COMMENT_SOURCES),
    }),
    meta: z.object({ deleted_datetime: z.string() }),
})
export type SocialMediaDeletedCommentSchema = z.infer<
    typeof socialMediaDeletedCommentSchema
>
const instagramStoryFlagSchema = z.union([z.literal(true), z.literal('true')])

export const socialMediaInstagramStoryMentionSchema = z.object({
    source: z.object({
        type: z.enum(SOCIAL_MEDIA_INSTAGRAM_DIRECT_MESSAGE_SOURCES),
    }),
    meta: z.object({ is_story_mention: instagramStoryFlagSchema }),
})
export type SocialMediaInstagramStoryMentionSchema = z.infer<
    typeof socialMediaInstagramStoryMentionSchema
>
export const socialMediaInstagramStoryReplySchema = z.object({
    source: z.object({
        type: z.enum(SOCIAL_MEDIA_INSTAGRAM_DIRECT_MESSAGE_SOURCES),
    }),
    meta: z.object({ is_story_reply: instagramStoryFlagSchema }),
})
export type SocialMediaInstagramStoryReplySchema = z.infer<
    typeof socialMediaInstagramStoryReplySchema
>
